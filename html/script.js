function updateFormUrl() {
    try {
        // Check if baseUrl is defined
        if (!baseUrl) {
            console.error("Base URL not set, unable to update form action");
            return;
        }
        
        // Get the selected environment
        const environmentSelect = document.getElementById("environment");
        if (!environmentSelect) {
            console.error("Environment select element not found");
            return;
        }
        
        const environment = environmentSelect.value;
        if (!environment) {
            console.error("No environment selected");
            return;
        }
        
        // Construct the action URL
        const actionUrl = baseUrl + "/organizations/" + environment + "/settings/apps/new?state=newlycreated";
        console.log("Setting form action URL to:", actionUrl);
        
        // Set the form action
        const form = document.getElementById("form");
        if (form) {
            form.action = actionUrl;
            console.log("Form action set successfully to:", form.action);
            
            // Update debug display if it exists
            const currentAction = document.getElementById("currentAction");
            if (currentAction) {
                currentAction.innerText = actionUrl;
            }
            
            const selectedEnv = document.getElementById("selectedEnv");
            if (selectedEnv) {
                selectedEnv.innerText = environment;
            }
        } else {
            console.error("Form element not found");
        }
    } catch (error) {
        console.error("Error in updateFormUrl:", error);
    }
}

function loadFile(url, isJson, callback) {
    var xobj = new XMLHttpRequest();                
    if (isJson) {
        xobj.overrideMimeType("application/json");                    
    }

    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);  
}

var baseUrl = "";

function getFile(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        //xhr.responseType = 'document';
        xhr.onload = function () {
            var status = xhr.status;
            if (status == 200) {
                resolve(xhr.responseText);
            } else {
                reject(status);
            }
        };
        xhr.send();
    });
}

async function getSettings() {
    fileLocation = "environments.json"
    settings = await getFile(fileLocation)

    console.log(`settings: ` + settings);

    return JSON.parse(settings)
}

function loadEnvironments() {
    console.log("Loading environments...");
    
    const fileLocation = "environments.json";
    loadFile(fileLocation, false, function(response) {
        console.log('Environments file loaded, content length:', response.length);
        
        try {
            const json = JSON.parse(response);
            console.log('Parsed environments:', json.environments);
            
            // Set the global baseUrl variable
            baseUrl = json.baseUrl;
            console.log('Base URL set to:', baseUrl);
            
            const envSelect = document.getElementById("environment");
            if (envSelect) {
                // Clear existing options first
                envSelect.innerHTML = '';
                
                // Add options for each environment
                if (json.environments && json.environments.length > 0) {
                    for(let i = 0; i < json.environments.length; i++) {
                        const environment = json.environments[i];
                        
                        const option = document.createElement("option");
                        option.value = environment;
                        option.innerHTML = environment;
                        envSelect.appendChild(option);
                        
                        console.log('Added environment option:', environment);
                    }
                    
                    // Select the first option by default
                    if (envSelect.options.length > 0) {
                        envSelect.selectedIndex = 0;
                    }
                    
                    // Make sure we have set the postback url
                    console.log('Updating form URL after loading environments');
                    setTimeout(updateFormUrl, 100);
                } else {
                    console.error('No environments found in JSON file');
                    // Add a default option
                    const option = document.createElement("option");
                    option.value = "YOUR_GITHUB_USERNAME";
                    option.innerHTML = "Replace with your GitHub username";
                    envSelect.appendChild(option);
                }
            } else {
                console.error('Environment select element not found');
            }
        } catch (error) {
            console.error('Error parsing environments JSON:', error);
        }
    });
}

function initPage() {
    // Load environments first
    loadEnvironments();

    // load the manifest
    jsonFileToUrl = "manifest1.json"
    loadFile(jsonFileToUrl, false, function(response) {
        console.log('Loading manifest from:', jsonFileToUrl);
        
        // remove everything behind the last "/""
        url = window.location.href
        lastSlash = url.lastIndexOf("/");
        url = url.substring(0, lastSlash);
        redirectUrl = url + "/redirect.html";        

        // replace the parameter in the manifest
        manifest = response.replace(/__redirectUrl__/g, redirectUrl);
        
        // Parse it to ensure it's valid JSON
        try {
            const manifestObj = JSON.parse(manifest);
            
            // Format it nicely and set the value
            input = document.getElementById("manifest")
            input.value = JSON.stringify(manifestObj, null, 2);
            
            // Make sure we update the form URL again after manifest is loaded
            setTimeout(updateFormUrl, 500);
            
            console.log('Manifest loaded successfully');
        } catch (error) {
            console.error('Error parsing manifest:', error);
            alert('Error loading manifest: ' + error.message);
        }
    })
}

function showAppInfo(xhr, settings) {
    console.log(`Return status: ` + xhr.status);
    console.log(`Return text:` + xhr.responseText);

    appName = document.getElementById("name")
    appId = document.getElementById("appId")
    pemKey = document.getElementById("pemKey")
    
    response = JSON.parse(xhr.responseText)

    appName.innerHTML = response.slug;
    appId.innerHTML = response.id;
    pemKey.value = response.pem;

    waiting = document.getElementById("waiting")
    waiting.style.display = "none";

    installationUrl = getAppInstallationUrl(settings)
    document.getElementById("installLink").href = installationUrl
}

function getAppInstallationUrl(settings) {
    return settings.baseUrl + "/organizations/" + response.owner.login + "/settings/apps/" + response.slug + "/installations"
}

async function loadRedirectPageInfo() {

    settings = await getSettings()    
    console.log(`settings.apiUrl: ` + settings.apiUrl);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    console.log(`Found this code: [${code}] with this state: [${state}]`);

    // post to github and retrieve appId and PEM key
    const apiUrl = settings.apiUrl + "/app-manifests/"+ code + "/conversions";
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            const timeout = setTimeout(showAppInfo(xhr, settings), 7500);
        }
        else {
            waiting = document.getElementById("waiting")
            waiting.innerHTML = "Error retrieving the information: " + xhr.status + " - " + xhr.responseText;
        }
    };
    xhr.open("POST", apiUrl);        
    xhr.send();    
}