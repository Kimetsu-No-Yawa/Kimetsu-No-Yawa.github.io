function setupCarousel(carouselId) {
    const container = document.getElementById(carouselId);
    const images = Array.from(container.querySelectorAll("img"));
    const desc = container.nextElementSibling;

    let currentIndex = 0;
    let intervalId;

    images.forEach((img, i) => {
        img.style.position = "absolute";
        img.style.top = "0";
        img.style.left = "0";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.style.transition = "transform 0.5s ease-in-out";
        img.style.transform = `translateX(${i * 100}%)`;
        img.style.cursor = "pointer";
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

    function startAuto() {
        intervalId = setInterval(nextImage, 7000);
    }

    function stopAuto() {
        clearInterval(intervalId);
    }

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "<";
    prevBtn.className = "carousel-arrow prev";
    prevBtn.onclick = () => {
        stopAuto();
        prevImage();
        startAuto();
    };

    const nextBtn = document.createElement("button");
    nextBtn.textContent = ">";
    nextBtn.className = "carousel-arrow next";
    nextBtn.onclick = () => {
        stopAuto();
        nextImage();
        startAuto();
    };

    container.append(prevBtn, nextBtn);

    let startX = 0;

    container.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    container.addEventListener("touchend", e => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
            stopAuto();
            diff > 0 ? nextImage() : prevImage();
            startAuto();
        }
    });

    function createLightbox() {
        const lightbox = document.createElement("div");
        const imgEl = document.createElement("img");
        const descEl = document.createElement("p");
        const closeBtn = document.createElement("span");

        let scale = 1;
        let startDistance = 0;
        let startScale = 1;

        lightbox.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.9);
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 9999;
            touch-action: none;
        `;

        imgEl.style.maxWidth = "90%";
        imgEl.style.maxHeight = "80%";
        imgEl.style.transition = "transform 0.15s ease";
        imgEl.style.touchAction = "none";

        descEl.style.color = "white";
        descEl.style.marginTop = "10px";

        closeBtn.innerHTML = "&times;";
        closeBtn.style.cssText = `
            position:absolute;
            top:20px;
            right:30px;
            font-size:32px;
            color:white;
            cursor:pointer;
        `;

        closeBtn.onclick = () => {
            lightbox.style.display = "none";
            scale = 1;
            imgEl.style.transform = "scale(1)";
        };

        imgEl.addEventListener("wheel", e => {
            e.preventDefault();
            scale += e.deltaY * -0.002;
            scale = Math.min(Math.max(scale, 1), 5);
            imgEl.style.transform = `scale(${scale})`;
        }, { passive: false });

        imgEl.addEventListener("touchstart", e => {
            if (e.touches.length === 2) {
                e.preventDefault();
                startDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                startScale = scale;
            }
        }, { passive: false });

        imgEl.addEventListener("touchmove", e => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                scale = startScale * (currentDistance / startDistance);
                scale = Math.min(Math.max(scale, 1), 5);
                imgEl.style.transform = `scale(${scale})`;
            }
        }, { passive: false });

        lightbox.append(closeBtn, imgEl, descEl);
        lightbox.addEventListener("click", e => {
            if (e.target === lightbox) closeBtn.onclick();
        });

        document.body.appendChild(lightbox);
        return { lightbox, imgEl, descEl };
    }

    const { lightbox, imgEl, descEl } = createLightbox();

    images.forEach(img => {
        img.addEventListener("click", () => {
            imgEl.src = img.src;
            descEl.textContent = img.dataset.desc;
            lightbox.style.display = "flex";
        });
    });

    showImage(currentIndex);
    startAuto();
}

setupCarousel("customer-carousel");
setupCarousel("admin-carousel");