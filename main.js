var index = [];

var items = [];
var subjects = {};

window.addEventListener('load', function () {
    let files = 0;

    fetch("./pdfData.json")
    .then((response) => response.json())
    .then((data) => {
        index = index.concat(data);
        files++;
        if(files >= 2) {
            main();
        }
    });

    fetch("./extras.json")
    .then((response) => response.json())
    .then((data) => {
        index = index.concat(data);
        files++;
        if(files >= 2) {
            main();
        }
    })
})

function main() {
    
    let list = document.getElementById("list");
    
    for(pdf of index.sort((a, b) => a.Title.localeCompare(b.Title))) {
        if(!(pdf.Subject in subjects)) {
            let container = document.createElement("li");
            let subject = document.createElement("ul");
            
            container.innerText = pdf.Subject;
            container.appendChild(subject);
            subjects[pdf.Subject] = subject;
            list.appendChild(container);
        }
        let root = subjects[pdf.Subject]

        let item = document.createElement("li");

        item.className = "pdflink"
        item.innerText = pdf.Title;
        item.setAttribute("data-metadata", JSON.stringify(pdf))
        item.onclick = function() {
            pdfViewer.src = JSON.parse(this.getAttribute('data-metadata')).Path;
        }

        let tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.innerText = `Title: ${pdf.Title}\nSubject: ${pdf.Subject}\nAuthor: ${pdf.Author}\nPages: ${pdf.Pages}\nKeywords: ${pdf.Keywords.map((k) => "\n\u00a0\u00a0\u00a0\u2022\u00a0\u00a0" + k)}.`;
        //tooltip.onclick = function(e) {
        //    e.target.style.visibility = 'hidden';
        //}
        item.onmouseover = function(e) {
            let tp = this.firstElementChild;

            tp.style.top = e.Y;
            tp.style.left = e.X;
        }

        item.appendChild(tooltip);

        root.appendChild(item);
        items.push(item);
    }

    let searchbar = document.getElementById("searchbar");
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
}