$(document).ready(function(){
    var gallery = null;

    $("#getSubscriptionWorkflows").click(function(){
        gallery = new Gallery($("#apiLocation").val().trim(), $("#apiKey").val().trim(), $("#apiSecret").val().trim());
        gallery.getSubscriptionWorkflows(function(workflows){
            var listStr = "";
            var len = workflows.length;
            if (len === 0) {
                listStr = "There are no workflows in the subscription associated with the given api key";
            }
            for (var i = 0; i < len; i++){
                listStr += "<li>" + workflows[i].metaInfo.name + " - " + workflows[i].id +  "</li>";
            }
            $("#workflowList").html(listStr);
        }, function(response){
            $("#workflowList").html(response.responseJSON && response.responseJSON.message || response.statusText);
        });
    });

    $("#getPublicWorkflows").click(function(){
        alert("coming soon!");
    });

    $("#getAppInterface").click(function(){
        var workflowId = $("#workflowId").val().trim();
        if (!workflowId) {
            $("#appInterface").html('<span class="red">please enter an app ID.</span>');
            return;
        }
        gallery = new Gallery($("#apiLocation").val().trim(), $("#apiKey").val().trim(), $("#apiSecret").val().trim());
        gallery.getAppQuestions(workflowId, function(questions){
            var listStr = "<table>";
            var len = questions.length;
            if (len === 0) {
                listStr = "This app has no questions.";
            }
            for (var i = 0; i < len; i++){
                var question = questions[i];
                listStr += '<tr><td class="name"><label>' + question.name + '</label></td><td><input type="text" class="' + question.type + '" value="' + (question.value || '') + '" name="' + question.name + '">';
                if (question.items){
                    listStr += '<div>options: ';
                    for (var j = 0; j < question.items.length; j++) {
                        listStr += question.items[j].value += (j < question.items.length-1) ? ", " : "";
                    }
                    listStr += '</div>';
                }
                listStr += '</td></tr>';
            }
            listStr += "</table>";
            $("#appInterface").html(listStr);
        }, function(response){
            var error = response.responseJSON && response.responseJSON.message || response.statusText;
            $("#appInterface").html('<span class="red">' + error + '</span>');
        });
    });

    $("#executeWorkflow").click(function(){
        var workflowId = $("#workflowId").val().trim();
        var questions = $("#appInterface").serializeArray();
        if (!workflowId) {
            $("#jobIdDiv").html('<span class="red">please enter a workflow Id.</span>');
            return;
        }
        $("#jobIdDiv").html('');
        gallery = new Gallery($("#apiLocation").val().trim(), $("#apiKey").val().trim(), $("#apiSecret").val().trim());
        gallery.executeWorkflow(workflowId, questions, function(job){
            $("#jobIdDiv").html('Job Id: ' + job.id);
        }, function(response){
            var error = response.responseJSON && response.responseJSON.message || response.statusText;
            $("#jobIdDiv").html('<span class="red">' + error + '</span>');
        });
    });

    $("#getJobsByWorkflow").click(function(){
        var workflowId = $("#workflowIdForJobs").val().trim();
        if (!workflowId) {
            $("#jobsByWorkflow").html('<span class="red">please enter a workflow Id.</span>');
            return;
        }
        gallery = new Gallery($("#apiLocation").val().trim(), $("#apiKey").val().trim(), $("#apiSecret").val().trim());
        gallery.getJobsByWorkflow(workflowId, function(jobs){
            var job;
            var jobString = "";
            var len = jobs.length;
            if (len === 0) {
                jobString = "This app has never been executed.";
            }
            for (var i = 0; i < len; i++){
                job = jobs[i];
                jobString += "<li>" + new Date(job.createDate).toLocaleString() + " - " + job.id + " - " + job.status + " - " + job.disposition + "</li>";
            }
            $("#jobsByWorkflow").html(jobString);
        }, function(response){
            var error = response.responseJSON && response.responseJSON.message || response.statusText;
            $("#jobsByWorkflow").html('<span class="red">' + error + '</span>');
        });
    });

    $("#getJobStatus").click(function(){
        var jobId = $("#jobId").val().trim();
        if (!jobId) {
            $("#jobDetails").html('<span class="red">please enter a job Id.</span>');
            return;
        }
        gallery = new Gallery($("#apiLocation").val().trim(), $("#apiKey").val().trim(), $("#apiSecret").val().trim());
        gallery.getJob(jobId, function(job){
            $("#jobDetails").html("<li>" + new Date(job.createDate).toLocaleString() + " - " + job.id + " - " + job.status + " - " + job.disposition + "</li>");
            var outputString = "<ul>";
            var outputs = job.outputs;
            for (var i = 0; i < outputs.length; i++){
                var output = outputs[i];
                outputString += "<li>" + output.name + " - " + output.id + " - [" + output.formats.toString() + "]";
            }
            $("#jobDetails").append(outputString);

            var message;
            var errorString = "<ul>";
            for (var j = 0; j < job.messages.length; j++) {
                message = job.messages[j];
                if (message.status === 3){
                    errorString += "<li>";
                    errorString += message.text += (message.toolId > 0) ? " (Tool Id: " + message.toolId + ")" : "";
                    errorString += "</li>";
                }
            }
            errorString += "</ul>";
            $("#jobDetails").append(errorString);
        }, function(response){
            var error = response.responseJSON && response.responseJSON.message || response.statusText;
            $("#jobDetails").html('<span class="red">' + error + '</span>');
        });
    });

    $("#getOutputFile").click(function(ev){
        var jobId = $("#jobId").val().trim();
        var outputId = $("#outputId").val().trim();
        var format = $("#format").val().trim();
        if (!jobId) {
            $("#outputError").html('<span class="red">please enter a job Id above.</span>');
            return;
        }
        if (!outputId) {
            $("#outputError").html('<span class="red">please enter an output Id.</span>');
            return;
        }
        gallery = new Gallery($("#apiLocation").val().trim(), $("#apiKey").val().trim(), $("#apiSecret").val().trim());
        var url = gallery.getOutputFileURL(jobId, outputId, format);

        $("#outputError").html('');
        window.location.assign(url);
    });
});