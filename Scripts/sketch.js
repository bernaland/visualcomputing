var xRotation = 0, yRotation = 0, zRotation = 0;
var directoryTree = {Name:"root", Directories: [], Files: []};

function setup(){
	var mainCanvas = createCanvas(1000, 600, WEBGL);
	mainCanvas.parent('canvasDiv');
}

function draw(){
	if (directoryTree.Directories.length > 0 || directoryTree.Files.length > 0) {
		background(0);
		//translate(-400, -200);
		rotateZ(radians(zRotation));
		rotateX(radians(xRotation));
		rotateY(radians(yRotation));
		push();
		drawDirectory(directoryTree.Directories, 150);
		pop();
		push();
		drawFile(directoryTree.Files, 40);
		pop();
	}
	treeWalk();
}

function drawDirectory(levelDirectories, radius){
	var arcStep = 360.0 / levelDirectories.length;
	var currentAngle = 0;
	var red = 255, green = 0, blue = 0;
	$.each(levelDirectories, function(index, directory){
		push();
		var xCoord = cos(radians(currentAngle)) * radius, yCoord = sin(radians(currentAngle)) * radius;
		push();
		stroke(255);
		line(0, 0, 0, xCoord, yCoord, 0);
		pop();
		translate(xCoord, yCoord, 0);
		push();
		fill(red, green, blue);
		stroke(red, green, blue);		
		sphere(20);
		pop();
		rotateY(radians(90));
		drawDirectory(directory.Directories, radius * 0.6);
		drawFile(directory.Files, 40);
		pop();
		currentAngle += arcStep;
	});
}

function drawFile(files, radius){
	var arcStep = 360.0 / files.length;
	var currentAngle = 0;
	$.each(files, function(index, file){
		push();
		var xCoord = cos(radians(currentAngle)) * radius, yCoord = sin(radians(currentAngle)) * radius;
		translate(xCoord, yCoord, 0);
		rotateX(radians(90));
		rotateY(radians(90));
		fill(0, 255, 0);
		cylinder(5, file.Count * 10);
		pop();
		currentAngle += arcStep;
	})
}

function treeWalk(){
	for (var i = commitData.length - 1; i >= 0; i--) {
		var item = commitData[0];
		directoryTree = walkDirectory(item.Directories, directoryTree);
		directoryTree = walkFiles(item.Files, directoryTree);
		
		commitData.shift();
	}
}

function walkFiles(commitFiles, parentDirectory){
	$.each(commitFiles, function(fileIndex, file){
		var neededIndex = 0;
		var fileInTree = $.grep(parentDirectory.Files, function(treeFile, treeIndex){
			var isEquals = treeFile.Name === (file.Name || file);
			neededIndex = isEquals ? treeIndex : neededIndex;
			return isEquals;
		});
		if (fileInTree.length < 1) {
			parentDirectory.Files.push({ Name: file, Count: 1});
		}else{
			parentDirectory.Files[neededIndex].Count++;
		}
	});
	return parentDirectory;
}

function walkDirectory(commitDirectories, parentDirectory){
	$.each(commitDirectories, function(folderIndex, directory){
		var directoryInTree = $.grep(parentDirectory.Directories, function(treeFolder, treeIndex){
			return treeFolder.Name === directory.Name;
		});
		if (directoryInTree.length < 1) {
			var newDirectory = {Name:directory.Name, Directories:[], Files:[]};
			newDirectory = walkDirectory(directory.Directories, newDirectory);
			newDirectory = walkFiles(directory.Files, newDirectory);
			parentDirectory.Directories.push(newDirectory);
		}
	});
	return parentDirectory;
}

function mouseDragged(){
	xRotation += (mouseX - pmouseX) > 0 ? 10 : -10;
	yRotation += (mouseY - pmouseY) > 0 ? 10 : -10;
}

function mouseWheel(event){
	zRotation += event.delta > 0 ? 10 : -10;
	return false;
}