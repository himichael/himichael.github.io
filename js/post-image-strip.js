(function () {
    function setupNav(strip) {
        var track = strip.querySelector(".post-image-strip-track");
        var prev = strip.querySelector(".post-image-strip-prev");
        var next = strip.querySelector(".post-image-strip-next");
        if (!track || !prev || !next) return;
        var imageCount = Number(strip.getAttribute("data-image-count") || 0);
        var pointerDownX = 0;
        var pointerDownY = 0;
        var dragged = false;

        function updateNav() {
            var maxScroll = track.scrollWidth - track.clientWidth;
            var hasOverflow = imageCount > 1 && maxScroll > 1;
            prev.hidden = !hasOverflow;
            next.hidden = !hasOverflow;
            prev.disabled = track.scrollLeft <= 1;
            next.disabled = track.scrollLeft >= maxScroll - 1;
        }

        function scrollTrack(direction) {
            var amount = Math.max(track.clientWidth * 0.8, 180);
            track.scrollBy({ left: direction * amount, behavior: "smooth" });
        }

        function openListGallery(anchor) {
            var itemsInStrip = Array.prototype.slice.call(strip.querySelectorAll("[data-gallery-item]"));
            var visibleThumbs = Array.prototype.slice.call(track.querySelectorAll(".post-image-strip-thumb"));
            var index = visibleThumbs.indexOf(anchor);
            if (index < 0) return;

            if (window.jQuery && window.jQuery.fancybox) {
                var items = itemsInStrip.map(function (thumb) {
                    return {
                        src: thumb.getAttribute("href"),
                        opts: {
                            caption: thumb.getAttribute("data-caption") || ""
                        }
                    };
                });
                window.jQuery.fancybox.open(items, { loop: true }, index);
                return;
            }

            window.open(anchor.getAttribute("href"), "_blank", "noopener");
        }

        prev.addEventListener("click", function () {
            scrollTrack(-1);
        });
        next.addEventListener("click", function () {
            scrollTrack(1);
        });
        track.addEventListener("pointerdown", function (event) {
            pointerDownX = event.clientX;
            pointerDownY = event.clientY;
            dragged = false;
        }, { passive: true });
        track.addEventListener("pointermove", function (event) {
            if (Math.abs(event.clientX - pointerDownX) > 8 || Math.abs(event.clientY - pointerDownY) > 8) {
                dragged = true;
            }
        }, { passive: true });
        track.addEventListener("click", function (event) {
            var target = event.target.closest(".post-image-strip-thumb");
            if (!target) return;
            if (dragged) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            event.preventDefault();
            openListGallery(target);
        }, true);
        track.addEventListener("scroll", updateNav);
        window.addEventListener("resize", updateNav);
        updateNav();
    }

    Array.prototype.forEach.call(document.querySelectorAll(".post-image-strip-list"), setupNav);

    var strip = document.querySelector(".post:not(.post-list) > .post-image-strip:not(.post-image-strip-list)");
    var content = document.querySelector(".post-content");
    if (!strip || !content) return;

    var track = strip.querySelector(".post-image-strip-track");
    if (!track) return;

    var seen = {};
    var images = Array.prototype.filter.call(content.querySelectorAll("img"), function (img) {
        var src = img.currentSrc || img.getAttribute("src");
        if (!src || seen[src]) return false;
        seen[src] = true;
        return true;
    });

    if (images.length < 2) return;

    var galleryItems = images.map(function (img) {
        var src = img.currentSrc || img.getAttribute("src");
        return {
            src: src,
            opts: {
                caption: img.getAttribute("alt") || ""
            }
        };
    });

    function openGallery(index) {
        if (window.jQuery && window.jQuery.fancybox) {
            window.jQuery.fancybox.open(galleryItems, {
                loop: true
            }, index);
            return;
        }

        window.open(galleryItems[index].src, "_blank", "noopener");
    }

    images.forEach(function (sourceImage, index) {
        var button = document.createElement("button");
        var thumb = document.createElement("img");
        var src = sourceImage.currentSrc || sourceImage.getAttribute("src");
        var alt = sourceImage.getAttribute("alt") || "";

        button.type = "button";
        button.className = "post-image-strip-thumb";
        button.setAttribute("aria-label", "Open image " + (index + 1));

        thumb.src = src;
        thumb.alt = alt;
        thumb.loading = "lazy";
        thumb.decoding = "async";

        button.appendChild(thumb);
        button.addEventListener("click", function () {
            openGallery(index);
        });

        if (!sourceImage.closest || !sourceImage.closest("a")) {
            sourceImage.style.cursor = "zoom-in";
            sourceImage.addEventListener("click", function () {
                openGallery(index);
            });
        }

        track.appendChild(button);
    });

    strip.hidden = false;
    setupNav(strip);
})();
