// Create the upper plate
module lowerPlate()
    cube([15,30,2]);
module upperPlate()
    translate([0,0,3])
        rotate([20,0,0])
            lowerPlate();
            
lowerPlate();
upperPlate();





// Join the two plates at the edge
difference() {
  union() {
    upperPlate();
    lowerPlate();
  }
  translate([0,-15,10]) {
    cylinder(r=10, h=40);
  }
}
