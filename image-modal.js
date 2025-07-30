// Image Fullscreen Modal Logic
document.addEventListener('DOMContentLoaded', function() {
  function isModalImg(img) {
    return img.id === 'image-modal-img';
  }
  function showImageModal(src) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('image-modal-img');
    modalImg.src = src;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function hideImageModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none';
    document.getElementById('image-modal-img').src = '';
    document.body.style.overflow = '';
  }
  document.body.addEventListener('click', function(e) {
    if (e.target.tagName === 'IMG' && !isModalImg(e.target)) {
      showImageModal(e.target.src);
      e.stopPropagation();
    }
  });
  document.getElementById('image-modal').addEventListener('click', hideImageModal);
  window.addEventListener('keydown', function() {
    const modal = document.getElementById('image-modal');
    if (modal.style.display === 'flex') hideImageModal();
  });
});
