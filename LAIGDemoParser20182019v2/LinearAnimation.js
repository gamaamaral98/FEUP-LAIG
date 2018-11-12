/**
 * LinearAnimation class - Represents a linear animation of an object
 */
class LinearAnimation extends Animation{
	
	/**
     * @constructor of the semi-sphere
     *
     * @param scene - Global scene
     * @param span - The time the animation will be active
     * @param controlPoints - Array of arrays that contain all the control points of the linear animation
     */
	constructor(scene, span, controlPoints){

		super(scene, span);

		this.span = span;

		this.linearMatrix = mat4.create();

		this.controlPoints = controlPoints;
	};

	// Returns the angle between 2 points
	getAnglePoints(cp1, cp2){

		// slope = (z2-z1)/(x2-x1)
		var z = cp2[2] - cp1[2];
		var x = cp2[0] - cp1[0];
		var dir = z/x;
		return atan(dir);
	};

	// Returns the distance between 2 points
	getDistancePoints(cp1, cp2){

		var x = pow(cp1[0]-cp2[0], 2);
		var y = pow(cp1[1]-cp2[1], 2);
		var z = pow(cp1[2]-cp2[2], 2);
		return sqrt(x+y+z);
	};

	// Returns the total distance of the whole animation
	getTotalDistance(){

		var distance = 0;
		for(var i = 0; i < (this.controlPoints.length-1); i++){

			distance += this.getDistancePoints(this.controlPoints[i], this.controlPoints[i+1]);
		}

		return distance;
	};

	// Returns the speed of the animation
	getSpeed(){
		var dist = this.getTotalDistance();
		var speed = dist / this.span;
		return speed;
	};

	// Returns an array with the times that must be spended between each 2 controlpoints
	getAnimationTimes(){

		var counter = 0.0;
		var times = [];
		times.push(counter);
		for(var i = 0; i < (this.controlPoints - 1); i++){

			var time = (getDistancePoints(this.controlPoints[i], this.controlPoints[i+1])/getTotalDistance())*this.span;
			counter += time;
			times.push(counter);
		}

		return times;
	};

	interpolation(c1, c2, percentage){

		//P = (P2 - P1)*(currTime/span) Interpolation

		var interpol = [];

		var x = (c2[0] - c1[0])*percentage;
		var y = (c2[1] - c2[1])*percentage;
		var z = (c2[2] - c2[2])*percentage;

		interpol.push(x,y,z);
		
		return interpol;

	};

	update(currentTime){

		if(currentTime <= this.span){

			var times = getAnimationTimes();

			console.log(times);

			for(var i = 0; i < times.length - 1; i++){

				if(currentTime >= times[i] && currentTime < times[i+1]){

					var percentage = currentTime/times[i];

					console.log(percentage);

					var P = interpolation(this.controlPoints[i], this.controlPoints[i+1], percentage);

					console.log(P);
					
					mat4.translate(this.linearMatrix, this.linearMatrix, P);

					console.log(this.linearMatrix);

					break;
				}else{
					continue;
				}
			}
		}
	};

	apply(){
		this.scene.multMatrix(this.linearMatrix);
	}

};