var index = [];
var extras = [];

var items = [];
var subjects = {};

var splitter_pos = 25;

window.addEventListener('load', function () {
    let files = 0;
    
    matchStyle();

    fetch("./pdfData.json")
    .then((response) => response.json())
    .then((data) => {
        //index = index.concat(data);
        index = data;
        files++;
        if(files >= 2) {
            main();
        }
    });

    fetch("./extras.json")
    .then((response) => response.json())
    .then((data) => {
        //index = index.concat(data);
        extras = data;
        files++;
        if(files >= 2) {
            main();
        }
    })
})
function main() {
    
    //Merge main index with extras, whilst removing duplicates
    index = index.filter((file) => !extras.map((extra) => extra.Path).includes(file.Path)).concat(extras);

    let list = document.getElementById("list");
    
    for(pdf of index.sort((a, b) => a.Title.localeCompare(b.Title)).sort((a, b) => a.Subject.localeCompare(b.Subject))) {
        if(!(pdf.Subject in subjects)) {
            let container = document.createElement("li");
            let subject = document.createElement("ul");
            
            container.innerText = pdf.Subject;
            container.style.listStyle = "none";
            container.appendChild(subject);
            subjects[pdf.Subject] = subject;
            list.appendChild(container);
        }
        let root = subjects[pdf.Subject]

        let item = document.createElement("li");

        item.className = "pdflink"
        item.innerText = pdf.Title;
        item.setAttribute("data-metadata", JSON.stringify(pdf))
        item.style.listStyle = 'disc';
        item.onclick = function(e) {
            pdfViewer.src = JSON.parse(this.getAttribute('data-metadata')).Path;

            let openLinks = document.getElementsByClassName("open");
            for(l of openLinks) {
                l.classList.remove("open");
            }

            e.target.classList.add("open");
        }

        //let tooltip = document.createElement('span');
        //tooltip.className = 'tooltip';
        //tooltip.innerText = `Title: ${pdf.Title}\nSubject: ${pdf.Subject}\nAuthor: ${pdf.Author}\nPages: ${pdf.Pages}\nKeywords: ${pdf.Keywords.map((k) => "\n\u00a0\u00a0\u00a0\u2022\u00a0\u00a0" + k)}.`;
        
        //item.onmouseover = function(e) {
        //let tp = this.firstElementChild;
        //
        //    tp.style.top = e.Y;
        //    tp.style.left = e.X;
        //}

        //item.appendChild(tooltip);

        root.appendChild(item);
        items.push(item);
    }

    var searchbar = document.getElementById("searchbar");
    searchbar.oninput = function(e) {
        let term = e.target.value.toLowerCase();

        for(item of items) {
            let metadata = JSON.parse(item.getAttribute('data-metadata'))
            let keywords = metadata.Keywords.map((k) => k.toLowerCase());
            let title = metadata.Title.toLowerCase();
            let subject = metadata.Subject.toLowerCase();
            let author = metadata.Author.toLowerCase();

            if(keywords.some((k) => k.includes(term)) || title.includes(term) || subject.includes(term) || author.includes(term)) {
                item.style.display = 'list-item';
            }
            else {
                item.style.display = 'none';
            }
        }

        for(subjectName in subjects) {
            let subject = subjects[subjectName];
            let container = subject.parentElement;
            
            let subjectEntries = items.filter((i) => JSON.parse(i.getAttribute('data-metadata')).Subject == subjectName);
            if(subjectEntries.some((i) => i.style.display == 'list-item')) {
                container.style.display = 'list-item';
            }
            else {
                container.style.display = 'none';
            }
        }
    }
    //Firefox preserves input on refresh, so we need to trigger the event manually
    searchbar.oninput({target: searchbar});

    //Some browsers also preserve the loaded pdf, so need to select the corresponding item
    //This approach does not work in Firefox, as it does not preserve the pdfViewer.src
    let pdfViewer = document.getElementById("pdfViewer");
    if(pdfViewer.src != "") {
        let pdf = index.find((f) => f.Path == pdfViewer.src);
        let item = items.find((i) => JSON.parse(i.getAttribute('data-metadata')).Path == pdfViewer.src);
        item.classList.add("open");
    }

    let splitter = document.getElementById("splitter");
    dragElement(splitter);
    splitter_pos = 25;

    //document.getElementById("collapse").addEventListener("click", onCollapseButtonClick);
    //window.addEventListener("click", onCollapseButtonClick);
    document.getElementById("collapse").onclick = onCollapseButtonClick;

    window.addEventListener("keydown",function (e) {
        if (e.key === "F3" || (e.ctrlKey && e.key == "f")) { 
            e.preventDefault();
            searchbar.focus();
        }
    })
    searchbar.focus();
}

function matchStyle() {
    // Firefox 1.0+
    let isFirefox = typeof InstallTrigger !== 'undefined';

    // Internet Explorer 6-11
    let isIE = /*@cc_on!@*/false || !!document.documentMode;

    // Edge 20+
    let isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 79
    let isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    // Edge (based on chromium) detection
    let isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

    if(isFirefox) {
        let style = `
        body {
            background-color: #2a2a2e;
        }
        #left {
            background-color: #323234;
            box-shadow: 1px 0px 0px #0c0c0d;
        }
        #list {
            color: #f9f9fa;
        }
        .pdflink {
            color: #c4c4c5;
            border-radius: 3px;
            padding-left: 5px;
            margin-left: -5;
        }
        .pdflink:hover, .pdflink.open {
            color: #c4c4c5;
            background-color: #666667;
            cursor: default;
        }
        #searchbar {
            min-height: 32px;
            max-height: 32px;
            box-shadow: 1px 1px 0px #0c0c0d;
            background-color: #38383d;
            color: #f9f9fa;
            font-size: medium;
        }
        #collapse {
            min-height: 32px;
            max-height: 32px;
            box-shadow: 1px 1px 0px #0c0c0d;
            background-color: #38383d;
            color: #f9f9fa;
            font-size: large;
            --border-radius: 3px;
        }
        #collapse:hover {
            background-color: #666667;
        }
        `
        let styleSheet = document.createElement("style");
        styleSheet.innerText = style;
        document.head.appendChild(styleSheet);
    }
    else if(isEdge || isEdgeChromium) {
        let style = `
        body {
            background-color: #E6E6E6;
        }
        #searchbar{
            min-height: 41px;
            max-height: 41px;
            background-color: #F7F7F7;
            border-style: solid;
            border-color: #BEBEBE;
            border-width: 1px;
            border-top: 0;
            border-left: 0px;
            box-shadow: none;
            color: black;
        }
        #left{
            box-shadow: none;
            background-color: #E6E6E6;
        }
        #list {
            border-style: solid;
            border-color: #BEBEBE;
            border-width: 1px;
            border-left: 0;
            border-top: 0;
            border-bottom: 0;
            color: black;
            box-shadow: none;
        }
        .pdflink{
            color: #767676;
        }
        .pdflink:hover, .pdflink.open {
            cursor:pointer;
            color: #767676;
            background-color: #EAEAEA;
        }
        `
        let styleSheet = document.createElement("style");
        styleSheet.innerText = style;
        document.head.appendChild(styleSheet);
    }
}

var collapsed = false;

function onCollapseButtonClick(e) {
    let left = document.getElementById("left");
    let right = document.getElementById("pdfViewer");
    let splitter = document.getElementById("splitter");

    if(collapsed) {
        collapsed = false;

        splitter.style.left = splitter_pos + "%";
        left.style.width = splitter_pos + "%";
        right.style.width = (100 - splitter_pos) + "%";
    }
    else {
        let buttonWidth = document.getElementById("collapse").offsetWidth
        
        collapsed = true;

        splitter.style.left = buttonWidth + "px";
        left.style.width = buttonWidth + "px";
        right.style.width = `calc(100vw - ${buttonWidth}px)`;
    }
}

function dragElement(element)
{
    const first  = document.getElementById("left");
    const second = document.getElementById("pdfViewer");

    element.onmousedown = onMouseDown;
    splitter_pos = first.width;

    function onMouseDown(e)
    {
        document.onmousemove = onMouseMove;
        document.onmouseup = () => {
            document.getElementById("masker").style.zIndex = -10;
            document.onmousemove = document.onmouseup = null;
        }
        document.getElementById("masker").style.zIndex = 10;
    }

    function onMouseMove(e)
    {
        let x = e.clientX / visualViewport.width * 100;

        element.style.left = x + "%";
        first.style.width = x + "%";
        second.style.width = (100 - x) + "%";

        splitter_pos = x;
        collapsed = false;
    }
}