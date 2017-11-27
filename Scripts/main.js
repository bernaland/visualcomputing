$(document).ready(function(){
	$("#beginDrawBtn").click(function(){
		var gitUser=$("input[name='gitUser']").val();
		var gitRepo = $("input[name='gitRepo']").val();
		var gitBranch = $("input[name='gitBranch']").val();

		loadGitData(gitUser, gitRepo, gitBranch);
	});
});