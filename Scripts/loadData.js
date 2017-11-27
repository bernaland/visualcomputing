var commitData = [];
var currentPage = 0;
var gitUrl = '';
var timer;
var gitUser = 'agbernala@unal.edu.co';
var gitToken = 'f051722b1f4eed6703570adb68de94415ae32250';
function loadGitData(userName, repoName, branchName){
	gitUrl = 'https://api.github.com/repos/'+userName+'/'+repoName+'/commits' + 
		(branchName !== '' && branchName !== undefined ? '?sha='+branchName:'');
	$.ajax({
		url: gitUrl,
		type: 'GET',
		dataType: 'json',
		async: false,
		cache: false,
		beforeSend: function (xhr) {
			xhr.setRequestHeader ("Authorization", "Basic " + btoa(gitUser + ":" + gitToken));
		},
		success: function(result, textStatus, response){
			var linkHeader = response.getResponseHeader('link');
			if (linkHeader !== null) {
				var pagesHeader = String(linkHeader);
				pagesHeader = pagesHeader.split(',')[1];
				pagesHeader = pagesHeader.split(';')[0];
				pagesHeader = pagesHeader.substring(pagesHeader.indexOf('&page='), pagesHeader.lenght).replace(/([^\d])/gi, '');
				//pagesHeader = pagesHeader.split('=')[1];
				currentPage = Number(pagesHeader);
			} else {
				currentPage = 1;
			}
		}
	});
	if (currentPage != 0) {
		getCommitData(false);
		timer = setInterval(function(){
			if (currentPage > 0) {
				getCommitData(true);
			}
		}, 15000);
	}
}

function getCommitData(isAsync){
	$.ajax({
		url: gitUrl + ('&page=' + currentPage),
		type: 'GET',
		dataType: 'json',
		async: isAsync,
		cache: false,
		beforeSend: function (xhr) {
			xhr.setRequestHeader ("Authorization", "Basic " + btoa(gitUser + ":" + gitToken));
		},
		success: function(result){
			currentPage--;
			reverse(result);
			$.each(result, function(index, item){
				//if (index % 5 == 0) {
					setTimeout(500);
				//}
				var commitContent = {
					Author: item.commit.author.name,
					Date: item.commit.author.date,
					Directories: [],
					Files: []
				};
				commitContent = readTree(item.url, commitContent, isAsync);
				commitData.push(commitContent);
			});
		}
	});
}

function readTree(treeUrl, content, isAsync){
	var buildDirectory = function(childDirectories, parentDirectory){
		var contentName = childDirectories[0];

		childDirectories.shift();
		if (childDirectories.length > 0) {
			var directoryIndex = -1;
			var directoryInTree = $.grep(parentDirectory.Directories, function(directory, dirIndex){
				directoryIndex = contentName === directory.Name ? dirIndex : directoryIndex;
				return contentName === directory.Name;
			});
			var currentDirectory = {Name: contentName, Directories: [], Files: []};	
			currentDirectory = buildDirectory(childDirectories, directoryInTree.length < 1 ? currentDirectory : directoryInTree[0]);
			if (directoryInTree.length < 1) {
				parentDirectory.Directories.push(currentDirectory);
			} else {
				parentDirectory.Directories[directoryIndex] = currentDirectory;
			}
		} else {
			var fileInTree = $.grep(parentDirectory.Files, function(file, fileIndex){
				return file === contentName;
			});
			if (fileInTree.length < 1) {
				parentDirectory.Files.push(contentName);
			}
		}
		return parentDirectory;
	}
	$.ajax({
		url: treeUrl,
		type: 'GET',
		dataType: 'json',
		async: isAsync,
		cache: false,
		beforeSend: function (xhr) {
			xhr.setRequestHeader ("Authorization", "Basic " + btoa(gitUser + ":" + gitToken));
		},
		success:function(treeResult){
			$.each(treeResult.files, function(treeIndex, treeItem){
				//if (index % 5 == 0) {
					setTimeout(500);
				//}
				var fileTree = treeItem.filename.split('/');

				content = buildDirectory(fileTree, content);
			})
		}
	});
	return content;
}