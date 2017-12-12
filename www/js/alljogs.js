const url = "http://138.68.164.214/jogs/";

fetch(url)
.then((resp) => {
    console.log("resp");
    return resp.json();
})
.then((resp) => {
    console.log(resp)
});