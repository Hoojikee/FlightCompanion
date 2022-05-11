$('document').ready(function () {
    //Load numbers into the dropdown
    const numOfConnDropdown = document.getElementById('numOfConnections');
    for (var i = 0; i <= 99; i++) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i;
        numOfConnDropdown.appendChild(opt);
    }
});