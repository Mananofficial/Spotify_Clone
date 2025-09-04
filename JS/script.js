
let currentsong = new Audio();
let songs;
let currfolder;

function formatSeconds(seconds, showMilliseconds = false) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = seconds % 1;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(secs).padStart(2, '0');

    if (showMilliseconds) {
        const formattedMillis = millis.toFixed(3).slice(1); // Get ".123"
        return `${formattedMinutes}:${formattedSeconds}${formattedMillis}`;
    }

    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Manan</div>
                            </div>
                            <div class="playnow">
                                <div>Play now</div>
                                <img class="invert" src="img/play.svg" alt="">
                            </div></li>`
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });
    return songs
}

const playmusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)

    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayalbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 22 24">
            <path d="M8 6v12l8-6-8-6z" fill="#000" stroke="black" stroke-linecap="round"
            stroke-linejoin="round" stroke-width="2" />
            </svg>
            
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h3>${response.title}</h3>
                        <p>${response.Description}</p>
                        </div>`
                    }
                }


Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async (item) => {
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

    playmusic(songs[0])
    })
});
}

async function main() {
    await getSongs("songs/ncs")
    playmusic(songs[0], true)

    displayalbums()


    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })


    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatSeconds(currentsong.currentTime)} / ${formatSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = (currentsong.duration * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -120 + "%"
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])

        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt((e.target.value)) / 100
        

    })

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })
}


main()
