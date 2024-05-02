
## Context

```mermaid
C4Context
title System Context diagram for HandexTerm Terminal System

Person(user, "User", "A user of the HandexTerm terminal.")
System(handexTerm, "HandexTerm", "The core terminal application logic.")
System_Ext(xterm, "XTerm", "The xterm.js terminal plugin.")
System(xtermAdapter, "XtermAdapter", "Adapts xterm.js for HandexTerm.")

Rel(user, handexTerm, "Uses")
Rel(handexTerm, xtermAdapter, "Interacts with")
Rel(xtermAdapter, xterm, "Controls and manages")
```

## Container

```mermaid
C4Container
title Container diagram for HandexTerm Terminal System

Person(user, "User", "A user of the HandexTerm terminal.")
Container(webApp, "Web Application", "Browser", "Serves the HandexTerm web interface.")
ContainerDb(localStorage, "Local Storage", "Web Storage", "Stores user session data and preferences.")

Rel(user, webApp, "Uses")
Rel(webApp, localStorage, "Reads from and writes to")
```

## Component

```mermaid
C4Component
title Component diagram for HandexTerm Web Application

Container(webApp, "Web Application", "Browser", "Serves the HandexTerm web interface.")

Component(handexTerm, "HandexTerm", "TypeScript", "Processes user commands and manages session.")
Component(xtermAdapter, "XtermAdapter", "TypeScript", "Adapts xterm.js for HandexTerm.")
Component(xterm, "XTerm", "JavaScript Library", "Provides terminal interface in the browser.")
Component(persistence, "Persistence", "TypeScript", "Handles saving and retrieving session data.")

Rel(user, handexTerm, "Inputs commands into")
Rel(handexTerm, xtermAdapter, "Sends processed commands to")
Rel(xtermAdapter, xterm, "Uses for terminal I/O")
Rel(handexTerm, persistence, "Stores and retrieves data with")
```