// This JS is only for testing purposes.

const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  if (window.scrollY === 0) {
    console.log('h');
    header.classList.remove('fixed');
  } else {
    header.classList.add('fixed');
  }
});