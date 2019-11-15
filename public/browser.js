document.addEventListener('click', function (e) {
    // only the element that was clicked on contains a class of edit-me
    if (e.target.classList.contains('edit-me')) {
        let userInput = prompt('enter your desired new text')
        axios.post('/update-item', {text: userInput}).then(function () {
            // do something interesting here in the next video
        }).catch(function () {
            console.log('please try again later');
        })
    }
})