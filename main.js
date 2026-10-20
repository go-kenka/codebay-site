document.documentElement.classList.add("js");

(function () {
  "use strict";

  var root = document.documentElement;
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = motionQuery.matches;
  var noHover = window.matchMedia("(hover: none)").matches;
  var $ = function (sel, scope) {
    return (scope || document).querySelector(sel);
  };
  var $$ = function (sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel));
  };
  var clamp = function (value, low, high) {
    return Math.min(high, Math.max(low, value));
  };
  var smooth = function (t) {
    return t * t * (3 - 2 * t);
  };

  var scrollers = [];
  var scrollQueued = false;
  function runScroll() {
    scrollQueued = false;
    var max = root.scrollHeight - window.innerHeight;
    for (var i = 0; i < scrollers.length; i += 1) {
      scrollers[i](window.scrollY, max);
    }
  }
  function requestScroll() {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(runScroll);
    }
  }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);

  var nav = $("#nav");
  var progress = $("#progressBar");
  scrollers.push(function (y, max) {
    if (nav) nav.classList.toggle("scrolled", y > 24);
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
  });

  var burger = $("#navBurger");
  if (nav && burger) {
    var setMenu = function (open) {
      nav.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    };
    burger.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });
    $$(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
  }

  var revealItems = $$(".rv");
  if (reduced || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) {
      el.classList.add("in");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    revealItems.forEach(function (el) {
      var delay = el.dataset.rv ? Number(el.dataset.rv) * 80 : 0;
      el.style.setProperty("--rvd", delay + "ms");
      revealObserver.observe(el);
    });
  }

  var titleLines = $$(".hero-title .tg");
  if (titleLines.length) {
    if (reduced) {
      titleLines.forEach(function (line) {
        line.classList.add("in");
      });
    } else {
      var order = 0;
      titleLines.forEach(function (line) {
        if (line.classList.contains("grad-text")) {
          line.classList.add("tg-line");
          return;
        }
        var chars = Array.from(line.textContent);
        line.textContent = "";
        var fragment = document.createDocumentFragment();
        chars.forEach(function (char) {
          var span = document.createElement("span");
          span.className = "ch";
          span.textContent = char === " " ? "\u00a0" : char;
          span.style.setProperty("--d", String(order));
          order += 1;
          fragment.appendChild(span);
        });
        line.appendChild(fragment);
      });
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          titleLines.forEach(function (line) {
            line.classList.add("in");
          });
        });
      });
    }
  }

  var hero = $("#hero");
  var spotlight = $("#spotlight");
  if (hero && spotlight && !noHover && !reduced) {
    var targetX = 50;
    var targetY = 18;
    var currentX = 50;
    var currentY = 18;
    var spotlightRunning = false;
    var drift = function () {
      spotlightRunning = false;
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      spotlight.style.setProperty("--mx", currentX + "%");
      spotlight.style.setProperty("--my", currentY + "%");
      if (Math.abs(targetX - currentX) > 0.08 || Math.abs(targetY - currentY) > 0.08) {
        spotlightRunning = true;
        window.requestAnimationFrame(drift);
      }
    };
    hero.addEventListener(
      "pointermove",
      function (event) {
        var box = hero.getBoundingClientRect();
        targetX = ((event.clientX - box.left) / box.width) * 100;
        targetY = ((event.clientY - box.top) / box.height) * 100;
        if (!spotlightRunning) {
          spotlightRunning = true;
          window.requestAnimationFrame(drift);
        }
      },
      { passive: true }
    );
  }

  var heroVisual = $("#heroVisual");
  var heroTerm = $("#heroTerm");
  if (heroVisual && heroTerm && !noHover && !reduced) {
    var termBox = null;
    heroVisual.addEventListener("pointerenter", function () {
      termBox = heroTerm.getBoundingClientRect();
      heroTerm.style.transition = "transform .18s ease-out";
    });
    heroVisual.addEventListener(
      "pointermove",
      function (event) {
        if (!termBox) termBox = heroTerm.getBoundingClientRect();
        var px = (event.clientX - termBox.left) / termBox.width - 0.5;
        var py = (event.clientY - termBox.top) / termBox.height - 0.5;
        heroTerm.style.transform =
          "rotateX(" + (-py * 5).toFixed(2) + "deg) rotateY(" + (px * 6).toFixed(2) + "deg)";
      },
      { passive: true }
    );
    heroVisual.addEventListener("pointerleave", function () {
      heroTerm.style.transform = "";
      heroTerm.style.transition = "";
      termBox = null;
    });
  }

  var typeEl = $("#typeText");
  var caretEl = $("#typeCaret");
  var rowsEl = $("#termRows");
  var phrase = "修登录、补测试、调研依赖——别让它们互相打架。";
  if (typeEl && rowsEl) {
    $$(".trow", rowsEl).forEach(function (row, index) {
      row.style.setProperty("--rd", index * 110 + "ms");
    });
    if (reduced) {
      typeEl.textContent = phrase;
      if (caretEl) caretEl.style.display = "none";
      rowsEl.classList.add("in");
    } else {
      typeEl.textContent = "";
      var charIndex = 0;
      var typeNext = function () {
        if (charIndex <= phrase.length) {
          typeEl.textContent = phrase.slice(0, charIndex);
          charIndex += 1;
          window.setTimeout(typeNext, charIndex < 4 ? 130 : 32);
          return;
        }
        if (caretEl) caretEl.style.display = "none";
        window.setTimeout(function () {
          rowsEl.classList.add("in");
        }, 280);
      };
      window.setTimeout(typeNext, 620);
    }
  }
  var storySection = $(".story-section");
  var storyStage = $("#storyStage");
  var storyFrame = $("#shotFrame");
  var chaosCards = storyStage ? $$(".chaos-card", storyStage) : [];
  if (storySection && storyStage && storyFrame) {
    var storyItems = [];
    var cacheStory = function () {
      var halfW = storyStage.clientWidth / 2;
      var halfH = storyStage.clientHeight / 2;
      storyItems = chaosCards
        .filter(function (card) {
          return card.offsetWidth > 0;
        })
        .map(function (card) {
        return {
          el: card,
          x: card.offsetLeft,
          y: card.offsetTop,
          w: card.offsetWidth,
          h: card.offsetHeight,
          r: parseFloat(card.style.getPropertyValue("--r")) || 0,
          cx: halfW,
          cy: halfH,
        };
      });
    };
    var paintStory = function (progress) {
      var collapse = smooth(clamp((progress - 0.02) / 0.26, 0, 1));
      var fade = 1 - smooth(clamp((progress - 0.14) / 0.16, 0, 1));
      storyItems.forEach(function (item) {
        var dx = item.cx - (item.x + item.w / 2);
        var dy = item.cy - (item.y + item.h / 2);
        item.el.style.transform =
          "translate3d(" +
          (dx * collapse).toFixed(1) +
          "px," +
          (dy * collapse).toFixed(1) +
          "px,0) rotate(" +
          (item.r * (1 - collapse)).toFixed(2) +
          "deg) scale(" +
          (1 - collapse * 0.72).toFixed(3) +
          ")";
        item.el.style.opacity = fade.toFixed(3);
      });
      var reveal = smooth(clamp((progress - 0.16) / 0.34, 0, 1));
      storyFrame.style.setProperty("--rx", (18 * (1 - reveal)).toFixed(2) + "deg");
      storyFrame.style.setProperty("--sc", (0.82 + 0.18 * reveal).toFixed(4));
      storyFrame.style.setProperty("--ty", (60 * (1 - reveal)).toFixed(1) + "px");
      storyFrame.style.setProperty("--op", reveal.toFixed(3));
      storySection.classList.toggle("is-after", progress > 0.22);
    };
    cacheStory();
    if (reduced) {
      paintStory(1);
    } else {
      scrollers.push(function () {
        var rect = storySection.getBoundingClientRect();
        var total = storySection.offsetHeight - window.innerHeight;
        var progress = total > 0 ? clamp(-rect.top / total, 0, 1) : 1;
        paintStory(progress);
      });
      var storyResize = 0;
      window.addEventListener("resize", function () {
        window.clearTimeout(storyResize);
        storyResize = window.setTimeout(function () {
          cacheStory();
          requestScroll();
        }, 160);
      });
    }
  }

  $$(".bento-card").forEach(function (card) {
    var spot = $(".card-spot", card);
    if (!spot || noHover || reduced) return;
    card.addEventListener(
      "pointermove",
      function (event) {
        var box = card.getBoundingClientRect();
        spot.style.setProperty("--x", event.clientX - box.left + "px");
        spot.style.setProperty("--y", event.clientY - box.top + "px");
      },
      { passive: true }
    );
  });

  if (!noHover && !reduced) {
    $$(".magnetic").forEach(function (el) {
      el.addEventListener(
        "pointermove",
        function (event) {
          var box = el.getBoundingClientRect();
          var x = (event.clientX - box.left - box.width / 2) / box.width;
          var y = (event.clientY - box.top - box.height / 2) / box.height;
          el.style.translate = (x * 5).toFixed(1) + "px " + (y * 4).toFixed(1) + "px";
        },
        { passive: true }
      );
      el.addEventListener("pointerleave", function () {
        el.style.translate = "";
      });
    });
  }

  var demo = $("#attDemo");
  if (demo) {
    var stateLabel = $("#demoState span");
    var demoNotify = $("#demoNotify");
    var demoGo = $("#demoGo");
    var demoLater = $("#demoLater");
    var demoReplay = $("#demoReplay");
    var demoClose = $("#demoNotifyClose");
    var demoTimers = [];
    var demoVisible = false;
    var defer = function (fn, ms) {
      demoTimers.push(window.setTimeout(fn, ms));
    };
    var clearDemoTimers = function () {
      demoTimers.forEach(function (id) {
        window.clearTimeout(id);
      });
      demoTimers = [];
    };
    var setDemoPhase = function (phase) {
      demo.classList.toggle("att-working", phase === "working");
      demo.classList.toggle("att-waiting", phase === "waiting");
      demo.classList.toggle("att-cleared", phase === "cleared");
      if (stateLabel) {
        stateLabel.textContent =
          phase === "waiting" ? "等待确认" : phase === "cleared" ? "已读" : "运行中";
      }
      if (demoNotify) demoNotify.style.display = "";
    };
    var cycleDemo = function () {
      clearDemoTimers();
      if (!demoVisible) return;
      if (reduced) {
        setDemoPhase("waiting");
        return;
      }
      setDemoPhase("working");
      defer(function () {
        setDemoPhase("waiting");
      }, 2600);
      defer(function () {
        setDemoPhase("cleared");
      }, 8200);
      defer(cycleDemo, 11200);
    };
    new IntersectionObserver(
      function (entries) {
        demoVisible = entries[0].isIntersecting;
        if (demoVisible) cycleDemo();
        else clearDemoTimers();
      },
      { threshold: 0.3 }
    ).observe(demo);
    if (demoGo) {
      demoGo.addEventListener("click", function () {
        clearDemoTimers();
        setDemoPhase("cleared");
        if (demoVisible) defer(cycleDemo, 3800);
      });
    }
    if (demoClose && demoNotify) {
      demoClose.addEventListener("click", function () {
        demoNotify.style.display = "none";
      });
    }
    if (demoLater && demoNotify) {
      demoLater.addEventListener("click", function () {
        demoNotify.style.display = "none";
      });
    }
    if (demoReplay) {
      demoReplay.addEventListener("click", function () {
        cycleDemo();
      });
    }
  }

  var navAnchors = $$(".nav-links a");
  if (navAnchors.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("id");
          var match = null;
          navAnchors.forEach(function (link) {
            if (link.getAttribute("href") === "#" + id) match = link;
          });
          navAnchors.forEach(function (link) {
            link.classList.toggle("active", link === match);
          });
        });
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: 0 }
    );
    ["control-room", "capabilities", "attention", "numbers", "cities", "start", "faq", "get"].forEach(
      function (id) {
        var section = document.getElementById(id);
        if (section) spy.observe(section);
      }
    );
  }

  var heroFlip = $("#heroFlip");
  if (heroFlip && !reduced) {
    var flipWords = ["Claude Code", "Codex", "OpenCode", "DeepSeek", "OMP", "Pi"];
    var flipIndex = 0;
    var flipTimer = 0;
    var flipNext = function () {
      var current = heroFlip.firstElementChild;
      if (!current) return;
      flipIndex = (flipIndex + 1) % flipWords.length;
      var next = document.createElement("span");
      next.textContent = flipWords[flipIndex];
      next.className = "in";
      heroFlip.appendChild(next);
      void next.offsetWidth;
      next.classList.remove("in");
      current.classList.add("out");
      window.setTimeout(function () {
        if (current.parentNode) current.parentNode.removeChild(current);
      }, 560);
    };
    var startFlip = function () {
      if (flipTimer) return;
      flipTimer = window.setInterval(flipNext, 2800);
    };
    var stopFlip = function () {
      if (!flipTimer) return;
      window.clearInterval(flipTimer);
      flipTimer = 0;
    };
    new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) startFlip();
        else stopFlip();
      },
      { threshold: 0.1 }
    ).observe(heroFlip);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopFlip();
      else startFlip();
    });
  }

  var statGrid = $(".stat-grid");
  if (statGrid) {
    var statNums = $$(".stat-num", statGrid);
    var countUp = function () {
      statNums.forEach(function (el) {
        var target = parseFloat(el.dataset.count || "0");
        var decimals = parseInt(el.dataset.dec || "0", 10);
        var prefix = el.dataset.prefix || "";
        var suffix = el.dataset.suffix || "";
        var render = function (value) {
          return prefix + value.toFixed(decimals) + suffix;
        };
        if (reduced) {
          el.textContent = render(target);
          return;
        }
        var startedAt = 0;
        var duration = 1500;
        el.textContent = render(0);
        var tick = function (time) {
          if (!startedAt) startedAt = time;
          var ratio = clamp((time - startedAt) / duration, 0, 1);
          var eased = 1 - Math.pow(1 - ratio, 3);
          el.textContent = render(target * eased);
          if (ratio < 1) window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      });
    };
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp();
          statObserver.disconnect();
        });
      },
      { threshold: 0.3 }
    );
    statObserver.observe(statGrid);
  }

  var faqItems = $$(".faq-item");
  faqItems.forEach(function (item) {
    var button = $(".faq-q", item);
    if (!button) return;
    button.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  var copyButton = $("#copyInstall");
  var installCommand = $("#installCmd");
  if (copyButton && installCommand) {
    copyButton.addEventListener("click", function () {
      var text = installCommand.textContent.trim();
      var label = copyButton.querySelector("span");
      var finish = function (ok) {
        if (!ok || !label) return;
        copyButton.classList.add("done");
        label.textContent = "已复制";
        window.setTimeout(function () {
          copyButton.classList.remove("done");
          label.textContent = "复制";
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () {
            finish(true);
          },
          function () {
            finish(false);
          }
        );
        return;
      }
      var area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (error) {
        ok = false;
      }
      area.remove();
      finish(ok);
    });
  }

  var getSection = $(".get-section");
  if (getSection) {
    if (reduced) {
      getSection.classList.add("in");
    } else {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) getSection.classList.add("in");
          });
        },
        { threshold: 0.25 }
      ).observe(getSection);
    }
  }

  var MAP = "000000000000000000000000000100110011111111001111111111111111111100000000000001110000000000000000000000000000000011000000000000000000000000000000|000000000000000000000001001010011001000000001111111111111111111100000000000000000000000000000000111000000000000111111000000000000000000000000000|000000000000000000000011110000000011010000000000001111111111111100000000000000000000000000000110000000000111111111111000000000001000000000000000|100000000100000000000000011111000110111111100000000111111111111000000000000000000000000000000110000111011111111111111111111101111111100000000000|000001111111111111111111110101000011101100111000000111111111100000000000000000011111111000000101111010111111111111111111111111111111111111111111|111100111111111111111111111111111111110000111110000111111100000001000000000001111111110100111111111111111111111111111111111111111111111111111111|000000001111111111111111111111111111010100011100000111110000000010000000000011110111111111111111111111111111111111111111111111111111111111111110|000000111111111111111111111111111100000001100000000011100000000000000000001111100111111111111111111111111111111111111111111111111111111011111000|000000011110000001111111111111111110000001111110000000000000000000000000001111100111111111111111111111111111111111111111111111111000000010000000|000000001000000000011111111111111111100001111110000000000000000000000010000101001111111111111111111111111111111111111111111111100000001110000000|000000000000000000001111111111111111111011111111100000000000000000001101000111111111111111111111111111111111111111111111111111110000001100000000|000000000000000000000111111111111111111111111111110000000000000000000011111111111111111111111111111111111111111111111111111111110000000000000000|000000000000000000000011111111111111111111110100111000000000000000000011111111111111111111111111111111111111111111111111111111110000000000000000|000000000000000000000011111111111111111111111100000000000000000000000001111111111111010111110111111111111111111111111111111111100000000000000000|000000000000000000000011111111111111111111110000000000000000000000000001111010111110000011101111111111111111111111111111111111000100000000000000|000000000000000000000011111111111111111111100000000000000000000000001111100001101111011011110011111111111111111111111111111100001000000000000000|000000000000000000000001111111111111111111000000000000000000000000001111000000101001111111110011111111111111111111111110001000001000000000000000|000000000000000000000001111111111111111111000000000000000000000000000000111100000000011111111111111111111111111111111111000100110000000000000000|000000000000000000000000011111111111111110000000000000000000000000000111111100000000001111111111111111111111111111111111000001000000000000000000|000000000000000000000000010111111111111000000000000000000000000000001111111111101110101111111111111111111111111111111111100000000000000000000000|000000000000000000000000001111111100000100000000000000000000000000001111111111111111111111101111111111111111111111111111100000000000000000000000|000000000000000000000000000011111000000100000000000000000000000000111111111111111111110111110011111111111111111111111111000000000000000000000000|000000000000000000000000000001111000000000000000000000000000000000111111111111111111110111111110000111111111111111111110100000000000000000000000|000000000000000000000000000000111000100000000000000000000000000001111111111111111111111011111111000011111110011111100000000000000000000000000000|000000000000000000000000000000111101100000011000000000000000000000111111111111111111111011111110000001111100001111010000000000000000000000000000|000000000000000000000000000000000111100000000000000000000000000001111111111111111111111101111000000001111000000111100000100000000000000000000000|000000000000000000000000000000000000111000000000000000000000000001111111111111111111111111100000000000110000000111110000110000000000000000000000|000000000000000000000000000000000000000000101000000000000000000000111111111111111111111110010000000000110000000101100000000000000000000000000000|000000000000000000000000000000000000000101111111000000000000000000011111111111111111111111110000000000000000000100000000001000000000000000000000|000000000000000000000000000000000000000001111111100000000000000000001111101111111111111111110000000000001000000010000000000000000000000000000000|000000000000000000000000000000000000000001111111111100000000000000000000000011111111111111100000000000000000000110000110000000000000000000000000|000000000000000000000000000000000000000011111111111100000000000000000000000011111111111111000000000000000000000011001110000000000000000000000000|000000000000000000000000000000000000000011111111111111000000000000000000000011111111111110000000000000000000000011001110100011000000000000000000|000000000000000000000000000000000000000011111111111111111000000000000000000011111111111100000000000000000000000001000000100000111100000000000000|000000000000000000000000000000000000000011111111111111111100000000000000000001111111111100000000000000000000000000100000000000011110000000000000|000000000000000000000000000000000000000011111111111111111100000000000000000001111111111100000000000000000000000000000001101000001000000000000000|000000000000000000000000000000000000000001111111111111111000000000000000000001111111111100000000000000000000000000000000000000000000000000000000|000000000000000000000000000000000000000001111111111111110000000000000000000001111111111100010000000000000000000000000000000011000000000000000000|000000000000000000000000000000000000000000011111111111110000000000000000000001111111111100110000000000000000000000000000011111100100000000000000|000000000000000000000000000000000000000000001111111111110000000000000000000001111111110000110000000000000000000000000000011111111110000000000000|000000000000000000000000000000000000000000001111111111110000000000000000000001111111110001100000000000000000000000000011111111111111000000000000|000000000000000000000000000000000000000000001111111111000000000000000000000000111111110001100000000000000000000000000111111111111111000000000000|000000000000000000000000000000000000000000001111111110000000000000000000000000111111100000000000000000000000000000000111111111111111100000000000|000000000000000000000000000000000000000000011111111100000000000000000000000000011111100000000000000000000000000000000011111111111111100000000000|000000000000000000000000000000000000000000011111111100000000000000000000000000011111000000000000000000000000000000000011111111111111100000000000|000000000000000000000000000000000000000000011111111000000000000000000000000000011100000000000000000000000000000000000011110000111111100000000000|000000000000000000000000000000000000000000011111100000000000000000000000000000000000000000000000000000000000000000000000000000001111000000000000|000000000000000000000000000000000000000000011111000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000010|000000000000000000000000000000000000000000111100000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000100|000000000000000000000000000000000000000000011100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000|000000000000000000000000000000000000000000111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000|000000000000000000000000000000000000000000111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000|000000000000000000000000000000000000000000110000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000|000000000000000000000000000000000000000000011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000|000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000|000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

  (function lightMap() {
    var canvas = $("#map");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var rows = MAP.split("|");
    var cols = rows[0].length;
    var rowCount = rows.length;
    var countEl = $("#cnt");
    var randomBtn = $("#mapRandom");
    var cells = [];
    for (var r = 0; r < rowCount; r += 1) {
      for (var c = 0; c < cols; c += 1) {
        if (rows[r].charAt(c) === "1") cells.push({ c: c, r: r });
      }
    }
    var CITY = [
      [104.07, 30.67],
      [116.4, 39.9],
      [121.47, 31.23],
      [114.06, 22.54],
      [120.15, 30.27],
      [139.69, 35.69],
      [103.82, 1.35],
      [-122.42, 37.77],
      [-74, 40.7],
      [-0.12, 51.5],
      [13.4, 52.5],
      [151.2, -33.87],
      [77.6, 12.97],
      [-46.63, -23.55],
    ];
    var lit = CITY.map(function (city, index) {
      return {
        c: Math.floor((city[0] + 180) / 2.5),
        r: Math.floor((80 - city[1]) / 2.5),
        t0: -9999,
        ph: index * 0.37,
      };
    });
    var width = 0;
    var height = 0;
    var cell = 0;
    var dpr = 1;
    var base = null;
    var baseCtx = null;
    var visible = false;
    var rafId = 0;
    var lastPaint = 0;
    var point = function (item) {
      return [(item.c + 0.5) * cell, (item.r + 0.5) * cell];
    };
    var setup = function () {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.clientWidth || 900;
      cell = width / cols;
      height = cell * rowCount;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.height = height + "px";
      base = document.createElement("canvas");
      base.width = canvas.width;
      base.height = canvas.height;
      baseCtx = base.getContext("2d");
      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      baseCtx.clearRect(0, 0, width, height);
      var gradient = baseCtx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(238,238,236,.20)");
      gradient.addColorStop(1, "rgba(238,238,236,.08)");
      baseCtx.fillStyle = gradient;
      for (var i = 0; i < cells.length; i += 1) {
        var dot = cells[i];
        baseCtx.beginPath();
        baseCtx.arc(
          (dot.c + 0.5) * cell,
          (dot.r + 0.5) * cell,
          Math.max(0.55, cell * 0.27),
          0,
          Math.PI * 2
        );
        baseCtx.fill();
      }
    };
    var paint = function (time) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (base) ctx.drawImage(base, 0, 0, width, height);
      if (!reduced) {
        var hub = point(lit[0]);
        for (var i = 1; i < lit.length; i += 1) {
          var target = point(lit[i]);
          var midX = (hub[0] + target[0]) / 2;
          var midY =
            (hub[1] + target[1]) / 2 -
            Math.hypot(target[0] - hub[0], target[1] - hub[1]) * 0.24;
          ctx.strokeStyle = "rgba(238,238,236,.12)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(hub[0], hub[1]);
          ctx.quadraticCurveTo(midX, midY, target[0], target[1]);
          ctx.stroke();
          var ratio = (time / 3600 + i * 0.13) % 1;
          var inverse = 1 - ratio;
          var x =
            inverse * inverse * hub[0] +
            2 * inverse * ratio * midX +
            ratio * ratio * target[0];
          var y =
            inverse * inverse * hub[1] +
            2 * inverse * ratio * midY +
            ratio * ratio * target[1];
          ctx.fillStyle = "rgba(238,238,236,.9)";
          ctx.shadowColor = "rgba(238,238,236,.9)";
          ctx.shadowBlur = 9;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.8, cell * 0.26), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      for (var j = 0; j < lit.length; j += 1) {
        var item = lit[j];
        var spot = point(item);
        if (!reduced) {
          var phase = (time / 1800 + item.ph) % 1;
          ctx.strokeStyle = "rgba(238,238,236," + (0.32 * (1 - phase)).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(spot[0], spot[1], cell * (0.7 + phase * 3.4), 0, Math.PI * 2);
          ctx.stroke();
          var age = (time - item.t0) / 900;
          if (age >= 0 && age < 1) {
            ctx.strokeStyle = "rgba(255,197,61," + (1 - age).toFixed(3) + ")";
            ctx.beginPath();
            ctx.arc(spot[0], spot[1], cell * (1 + age * 8), 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        var preset = j < CITY.length;
        ctx.fillStyle = preset ? "rgba(238,238,236,.95)" : "rgba(255,197,61,.95)";
        ctx.shadowColor = preset ? "#eeeeec" : "#ffc53d";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(spot[0], spot[1], cell * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (countEl) countEl.textContent = String(lit.length);
    };
    var loop = function (time) {
      if (!visible) return;
      if (time - lastPaint > 34) {
        lastPaint = time;
        paint(time);
      }
      rafId = window.requestAnimationFrame(loop);
    };
    var start = function () {
      if (reduced || rafId || !visible) return;
      rafId = window.requestAnimationFrame(loop);
    };
    var stop = function () {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = 0;
    };
    var nearest = function (clientX, clientY) {
      var box = canvas.getBoundingClientRect();
      var targetC = Math.floor((clientX - box.left) / cell);
      var targetR = Math.floor((clientY - box.top) / cell);
      var best = null;
      var bestDistance = Infinity;
      for (var dr = -3; dr <= 3; dr += 1) {
        for (var dc = -3; dc <= 3; dc += 1) {
          var rr = targetR + dr;
          var cc = targetC + dc;
          if (rr < 0 || rr >= rowCount || cc < 0 || cc >= cols) continue;
          if (rows[rr].charAt(cc) !== "1") continue;
          var distance = dr * dr + dc * dc;
          if (distance < bestDistance) {
            bestDistance = distance;
            best = { c: cc, r: rr };
          }
        }
      }
      return best;
    };
    var light = function (spot) {
      if (!spot) return;
      for (var i = 0; i < lit.length; i += 1) {
        if (lit[i].c === spot.c && lit[i].r === spot.r) return;
      }
      lit.push({ c: spot.c, r: spot.r, t0: performance.now(), ph: Math.random() });
      if (reduced) paint(performance.now());
    };
    canvas.addEventListener("click", function (event) {
      light(nearest(event.clientX, event.clientY));
    });
    if (randomBtn) {
      randomBtn.addEventListener("click", function () {
        for (var tries = 0; tries < 60; tries += 1) {
          var candidate = cells[Math.floor(Math.random() * cells.length)];
          var used = lit.some(function (item) {
            return item.c === candidate.c && item.r === candidate.r;
          });
          if (!used) {
            light(candidate);
            if (reduced) paint(performance.now());
            return;
          }
        }
      });
    }
    if (!reduced) {
      new IntersectionObserver(
        function (entries) {
          visible = entries[0].isIntersecting;
          if (visible) start();
          else stop();
        },
        { threshold: 0.15 }
      ).observe(canvas);
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop();
        else start();
      });
    }
    new ResizeObserver(function () {
      setup();
      paint(reduced ? 0 : performance.now());
    }).observe(canvas);
    setup();
    paint(0);
    if (reduced) visible = true;
  })();

  window.__codebayReady = true;
  root.classList.add("ready");
  root.classList.remove("js-fallback");
  requestScroll();
})();
