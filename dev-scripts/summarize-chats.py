import os
from openai import OpenAI  # or another library if you're using a different API
import re
from datetime import datetime, timedelta
import argparse

print(f'Running summarize-chats.py')
# Create the parser
parser = argparse.ArgumentParser(description='Python script to summarise Codeium chats and add a dated title to them')

# Add the named parameter (option)
parser.add_argument('-p', '--path', help='The path to use', required=True)

# Parse the arguments
args = parser.parse_args()

# Access the argument value
path = args.path
print(f'The provided path is: {path}')

# Define the directory containing the chat files
directory = path
client = OpenAI(
    # This is the default and can be omitted
    api_key=os.environ.get("OPENAI_API_KEY"),
)


# Loop through each file in the directory tree
for dirpath, dirnames, filenames in os.walk(path):
    for filename in filenames:
        if filename.startswith("Codeium Chat - ") and filename.endswith(".md"):  # assuming the files are Markdown
            print(f"Processing file: {os.path.join(dirpath, filename)}")
            filepath = os.path.join(dirpath, filename)
            file_modification_datetime = os.path.getmtime(filepath)
            file_creation_datetime_obj = datetime.fromtimestamp(os.path.getctime(filepath))
            # If the file was modified within the last 24 hours, skip it
            # if datetime.now() - file_creation_datetime_obj < timedelta(days=1):
            #     continue

            # Read the content of the file
            with open(filepath, "r", encoding="utf-8") as file:
                content = file.read()

            # Look for the first occurrence of the pattern matching `**User** _at 10:18 am, Apr 24, 2024_` and convert it to a datetime object
            datetime_pattern = r"\d{1,2}:\d{2} [ap]m, [A-Z][a-z]{2} \d{1,2}, \d{4}"
            date_format = "%I:%M %p, %b %d, %Y"
            date_str = re.search(datetime_pattern, content)
            if date_str:
                date_str = date_str.group(0)
                # Parse the datetime string into a datetime object
                date_obj = datetime.strptime(date_str, date_format)

            # Parse the content into smaller pieces if needed
            # For example:
            # chat_contents = re.split(r'some_pattern', content)
            # Define a safe character limit, for example:
            safe_char_limit = 16_000  # Adjust this limit based on observations

            # Truncate the content if it's too long
            truncated_content = content if len(content) <= safe_char_limit else content[:safe_char_limit]

            # Now use `truncated_content` instead of `content` when sending to the API

            # Obtain a summary from the API
            # You will need to set up the API and provide the necessary keys and configuration
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Summarize this chat:"},
                    {"role": "assistant", "content": truncated_content},  # Your chat content here
                ],
            )

            summary = response.choices[0].message.content

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {
                        "role": "user",
                        "content": "Create a tl;dr title describing the contents of the chat with no puctuation of ten words or less for this chat:",
                    },
                    {"role": "assistant", "content": summary},  # Your chat content here
                ],
            )

            title = response.choices[0].message.content

            # create a timecode in the format YYYY-MM-DD from the date_obj or the file_creation_datetime_obj
            date_code = (
                date_obj.strftime("%Y-%m-%d")
                if date_obj
                else file_creation_datetime_obj.strftime("%Y-%m-%d")
            )
            # Write the original file name and the summary to the top of the file
            new_content = (
                "---\n"
                "original file name: " + filename + "\n"
                "summary: " + summary + "\n"
                "date: " + date_obj.strftime("%Y-%m-%dT%H:%M") + "\n"
                "---\n\n" + content
            )

            with open(os.path.join(dirpath, filepath), "w", encoding="utf-8") as file:
                file.write(new_content)

            # Rename the file with datetime formatted to YYYY-MM-DD and lowercase title with spaces replaced with hyphens
            title = title.lower().replace(' ', '-').replace('_', '-')
            title_replace_pattern = r"[^\w\-]"
            title = re.sub(title_replace_pattern, "", title)
            new_filename = date_code + "-" + title + ".md"
            print(f"Renaming {filename} to {new_filename}")
            os.rename(os.path.join(dirpath, filepath), os.path.join(dirpath, new_filename))

    # Replace 'openai.Completion.create' with the corresponding function call
    # if you are using Langchain or a different API.
