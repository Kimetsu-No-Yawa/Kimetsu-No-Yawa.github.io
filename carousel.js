function setupCarousel(carouselId) {
    const container = document.getElementById(carouselId);
    const images = Array.from(container.querySelectorAll("img"));
    const desc = container.nextElementSibling;
    let currentIndex = 0;
    let intervalId;

    images.forEach((img, i) => {
        img.style.transform = `translateX(${i * 100}%)`;
        img.style.position = "absolute";
        img.style.top = "0";
        img.style.left = "0";
        img.style.transition = "transform 0.5s ease-in-out";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
    });

    function showImage(index) {
        images.forEach((img, i) => {
            img.style.transform = `translateX(${(i - index) * 100}%)`;
        });

        desc.classList.remove("active");
        setTimeout(() => {
            desc.textContent = images[index].dataset.desc;
            desc.classList.add("active");
        }, 200);
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    }

    function prevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    }

    if (window.innerWidth > 768) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "<";
        prevBtn.className = "carousel-arrow prev";
        prevBtn.onclick = () => { stopAuto(); prevImage(); startAuto(); };

        const nextBtn = document.createElement("button");
        nextBtn.textContent = ">";
        nextBtn.className = "carousel-arrow next";
        nextBtn.onclick = () => { stopAuto(); nextImage(); startAuto(); };

        container.append(prevBtn, nextBtn);
    }

    function startAuto() { intervalId = setInterval(nextImage, 7000); }
    function stopAuto() { clearInterval(intervalId); }

    let startX = 0;
    container.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    container.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
            stopAuto();
            if (diff > 0) nextImage();
            else prevImage();
            startAuto();
        }
    });

    function createLightbox() {
        let lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            flex-direction: column;
        `;
        const imgEl = document.createElement('img');
        imgEl.id = 'lightbox-img';
        imgEl.style.maxWidth = '90%';
        imgEl.style.maxHeight = '80%';
        const descEl = document.createElement('p');
        descEl.id = 'lightbox-desc';
        descEl.style.color = 'white';
        descEl.style.marginTop = '10px';
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = 'position:absolute;top:20px;right:30px;font-size:30px;color:white;cursor:pointer;';
        closeBtn.addEventListener('click', () => lightbox.style.display = 'none');
        lightbox.append(closeBtn, imgEl, descEl);
        lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.style.display='none'; });
        document.body.appendChild(lightbox);
        return { lightbox, imgEl, descEl };
    }

    const { lightbox, imgEl, descEl } = createLightbox();

    images.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            imgEl.src = img.src;
            descEl.textContent = img.dataset.desc;
            lightbox.style.display = 'flex';
        });
    });

    showImage(currentIndex);
    startAuto();

    window.addEventListener('resize', () => {
        const arrowsExist = container.querySelector('.carousel-arrow');
        if (window.innerWidth <= 768 && arrowsExist) {
            container.querySelectorAll('.carousel-arrow').forEach(a => a.remove());
        } else if (window.innerWidth > 768 && !arrowsExist) {
            const prevBtn = document.createElement("button");
            prevBtn.textContent = "<";
            prevBtn.className = "carousel-arrow prev";
            prevBtn.onclick = () => { stopAuto(); prevImage(); startAuto(); };
            const nextBtn = document.createElement("button");
            nextBtn.textContent = ">";
            nextBtn.className = "carousel-arrow next";
            nextBtn.onclick = () => { stopAuto(); nextImage(); startAuto(); };
            container.append(prevBtn, nextBtn);
        }
    });
}

setupCarousel("customer-carousel");
setupCarousel("admin-carousel");