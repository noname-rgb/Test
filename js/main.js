$(function () {
  if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
      "use strict";
      if (this == null) {
        throw new TypeError("can't convert " + this + " to object");
      }
      var str = "" + this;
      count = +count;
      if (count != count) {
        count = 0;
      }
      if (count < 0) {
        throw new RangeError("repeat count must be non-negative");
      }
      if (count == Infinity) {
        throw new RangeError("repeat count must be less than infinity");
      }
      count = Math.floor(count);
      if (str.length == 0 || count == 0) {
        return "";
      }
      // Обеспечение того, что count является 31-битным целым числом, позволяет нам значительно
      // соптимизировать главную часть функции. Впрочем, большинство современных (на август
      // 2014 года) браузеров не обрабатывают строки, длиннее 1 << 28 символов, так что:
      if (str.length * count >= 1 << 28) {
        throw new RangeError(
          "repeat count must not overflow maximum string size"
        );
      }
      var rpt = "";
      for (var i = 0; i < count; i++) {
        rpt += str;
      }
      return rpt;
    };
  }

  // https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
  if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
      targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
      padString = String(typeof padString !== "undefined" ? padString : " ");
      if (this.length > targetLength) {
        return String(this);
      } else {
        targetLength = targetLength - this.length;
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
        }
        return padString.slice(0, targetLength) + String(this);
      }
    };
  }

  $.fn.flipper = function (action, options) {
    var $flipper = $(this);
    var action = action || "init";
    var settings = $.extend(
      {
        // defaults.
        reverse: $flipper.data("reverse") || false,
        datetime: $flipper.data("datetime") || "now",
        template: $flipper.data("template") || "HH:ii:ss",
        labels: $flipper.data("labels") || "Hours|Minutes|Seconds",
        preload: true,
      },
      options
    );

    if (action === "init") {
      if ($flipper.hasClass("flipper-initialized")) {
        console.warn("Flipper already initialized.");
        return;
      }
      $flipper.addClass("flipper-initialized");

      var templateParts = settings.template.split("|");
      var labelsArray = settings.labels.split("|");
      var n;

      templateParts.forEach(function (part, index) {
        if (index > 0) {
          $flipper.append(
            '<div class="flipper-group flipper-delimiter">:</div>'
          );
        }
        $flipper.append(
          '<div class="flipper-group flipper-' + part + '"></div>'
        );
        var $part = $flipper.find(".flipper-group.flipper-" + part);
        if (typeof labelsArray[index] !== "undefined") {
          $part.append("<label>" + labelsArray[index] + "</label>");
        }
        if (part === "d" || part === "H" || part === "i" || part === "s") {
          var rev = settings.reverse ? "reverse" : "";
          $part.append('<div class="flipper-digit ' + rev + '"></div>');
        }
        if (
          part === "dd" ||
          part === "ddd" ||
          part === "HH" ||
          part === "ii" ||
          part === "ss"
        ) {
          var rev = settings.reverse ? "reverse" : "";
          $part.append('<div class="flipper-digit ' + rev + '"></div>');
          $part.append('<div class="flipper-delimiter"></div>');
          $part.append('<div class="flipper-digit ' + rev + '"></div>');
          if (part === "ddd") {
            $part.append('<div class="flipper-delimiter"></div>');
            $part.append('<div class="flipper-digit ' + rev + '"></div>');
          }
        }
        if (part === "d") {
          for (n = 0; n <= 31; n++) {
            $part
              .find(".flipper-digit:eq(0)")
              .append('<div class="digit-face">' + n + "</div>");
            $part
              .find(".flipper-digit:eq(1)")
              .append('<div class="digit-face">' + n + "</div>");
          }
        }
        if (part === "H") {
          for (n = 0; n <= 23; n++) {
            $part
              .find(".flipper-digit:eq(0)")
              .append('<div class="digit-face">' + n + "</div>");
            $part
              .find(".flipper-digit:eq(1)")
              .append('<div class="digit-face">' + n + "</div>");
          }
        }
        if (part === "i" || part === "s") {
          for (n = 0; n <= 59; n++) {
            $part
              .find(".flipper-digit:eq(0)")
              .append('<div class="digit-face">' + n + "</div>");
            $part
              .find(".flipper-digit:eq(1)")
              .append('<div class="digit-face">' + n + "</div>");
          }
        }
        if (part === "dd" || part === "ddd") {
          for (n = 0; n <= 9; n++) {
            $part
              .find(".flipper-digit:eq(0)")
              .append('<div class="digit-face">' + n + "</div>");
            $part
              .find(".flipper-digit:eq(1)")
              .append('<div class="digit-face">' + n + "</div>");
            if (part === "ddd") {
              $part
                .find(".flipper-digit:eq(2)")
                .append('<div class="digit-face">' + n + "</div>");
            }
          }
        }
        if (part === "HH") {
          for (n = 0; n <= 2; n++) {
            $part
              .find(".flipper-digit:eq(0)")
              .append('<div class="digit-face">' + n + "</div>");
          }
          for (n = 0; n <= 9; n++) {
            $part
              .find(".flipper-digit:eq(1)")
              .append('<div class="digit-face">' + n + "</div>");
          }
        }
        if (part === "ii" || part === "ss") {
          for (n = 0; n <= 5; n++) {
            $part
              .find(".flipper-digit:eq(0)")
              .append('<div class="digit-face">' + n + "</div>");
          }
          for (n = 0; n <= 9; n++) {
            $part
              .find(".flipper-digit:eq(1)")
              .append('<div class="digit-face">' + n + "</div>");
          }
        }
      });

      if (settings.preload) {
        setFlipperDate($flipper, settings.datetime, false);
      }

      setInterval(function () {
        setFlipperDate($flipper, settings.datetime, true);
      }, 1000);

      upsizeToParent($flipper);
      $(window).on("resize", function () {
        upsizeToParent($flipper);
      });
    }

    var flipTime = 400;
    var $body = $("body");

    function flipDigit($digit) {
      if (!$digit.closest(".flipper").is(".flipper-initialized")) {
        return;
      }
      if ($digit.hasClass("r")) {
        setTimeout(function () {
          flipDigit($digit);
        }, flipTime + 1);
        return;
      }
      $digit.addClass("r");

      var $currentTop = $digit.find(".digit-top");
      var $currentTop2 = $digit.find(".digit-top2");
      var $currentBottom = $digit.find(".digit-bottom");
      var $activeDigit = $digit.find(".digit-face.active");
      var $firstDigit = $digit.find(".digit-face:first");
      var $prevDigit = $activeDigit.prev(".digit-face");
      var $nextDigit = $activeDigit.next(".digit-face");
      var $lastDigit = $digit.find(".digit-face:last");
      if ($digit.hasClass("reverse")) {
        var $next = $prevDigit.length ? $prevDigit : $lastDigit;
      } else {
        var $next = $nextDigit.length ? $nextDigit : $firstDigit;
      }
      var current = parseInt($currentTop.html());
      var next = $next.html();
      $digit.find(".digit-next").html(next);
      $digit.find(".digit-face").removeClass("active");
      $next.addClass("active");
      $currentTop.addClass("r");
      $currentTop2.addClass("r");
      $currentBottom.addClass("r");
      if (next.toString() === $digit.attr("data-value")) {
        $digit.removeAttr("data-value");
      }
      setTimeout(function () {
        $currentTop.html(next).hide();
        $currentTop2.html(next);
        setTimeout(function () {
          $currentBottom.html(next).removeClass("r");
          $currentTop.removeClass("r").show();
          $currentTop2.html(next).removeClass("r");
          $digit.removeClass("r");
        }, flipTime / 2);
      }, flipTime / 2);
    }

    function upsizeToParent($flipper) {
      var parentWidth;
      var flipperWidth;
      var maxFontSize = 1000;
      var fontSize = maxFontSize;
      var i = 0;
      var minFontSize = 0;
      $flipper.css("font-size", fontSize + "px");
      while (i < 20) {
        i++;
        parentWidth = $flipper.innerWidth();
        $flipper.css("width", "9999px");
        flipperWidth = 0;
        $flipper.find(".flipper-group").each(function () {
          var w = parseFloat($(this).outerWidth());
          flipperWidth += w;
        });
        if (parentWidth - flipperWidth < 10 && parentWidth - flipperWidth > 0) {
          $flipper.css("width", "");
          return;
        }
        if (flipperWidth > parentWidth) {
          maxFontSize = fontSize < maxFontSize ? fontSize : maxFontSize;
        } else {
          minFontSize = fontSize > minFontSize ? fontSize : minFontSize;
        }
        fontSize = (maxFontSize + minFontSize) / 2;
        $flipper.css("width", "");
        $flipper.css("font-size", fontSize + "px");
      }
    }

    function setDigitValue(digitIndex, value) {
      var $flipper = $(".flipper");
      var $digit = $flipper.find(".flipper-digit:eq(" + digitIndex + ")");
      var currentValue = getDigitValue($digit);
      if (currentValue.toString() === value.toString()) {
        return; // has same value, do nothing
      }
      $digit.attr("data-value", value);
    }

    setInterval(function () {
      var $flipper = $(".flipper");
      $flipper.find(".flipper-digit[data-value]").each(function () {
        var $digit = $(this);
        if ($digit.find(".active").html() === $digit.attr("data-value")) {
          return; //
        }
        if (!$digit.is(".r")) {
          flipDigit($digit);
        }
      });
    }, flipTime / 4);

    function formatFlipperDate(dateStr) {
      var a = dateStr.split(" ");
      var d = a[0].split("-");
      var t = a[1].split(":");
      var date = new Date(d[0], d[1] - 1, d[2], t[0], t[1], t[2]);
      return date;
    }

    function addAppearance($flipper) {
      $flipper.find(".flipper-digit").each(function () {
        var $digit = $(this);
        var value = $digit.find(".digit-face.active").html();
        $digit.find(".digit-top").remove();
        $digit.find(".digit-top2").remove();
        $digit.find(".digit-bottom").remove();
        $digit.find(".digit-next").remove();
        $digit.prepend('<div class="digit-top">' + value + "</div>");
        $digit.prepend('<div class="digit-top2">' + value + "</div>");
        $digit.prepend('<div class="digit-bottom">' + value + "</div>");
        $digit.prepend('<div class="digit-next"></div>');
      });
    }

    function setFlipperDate($flipper, dateString, animate) {
      var animate = animate || false;
      if (!$flipper.is(":visible")) {
        $flipper.addClass("flipper-invisible");
        return;
      }
      if ($flipper.hasClass("flipper-invisible")) {
        $flipper.removeClass("flipper-invisible");
        upsizeToParent($flipper);
        setFlipperDate($flipper, settings.datetime, false);
      }
      var now = Date.now();
      if (dateString === "now") {
        var now = new Date();
        var seconds = now.getSeconds();
        var minutes = now.getMinutes();
        var hours = now.getHours();
        var days = now.getDate();
      } else {
        var timestamp = Date.parse(formatFlipperDate(dateString));
        var remainder = (timestamp - now) / 1000;
        var days = Math.floor(remainder / 60 / 60 / 24);
        remainder -= days * 60 * 60 * 24;
        var hours = Math.floor(remainder / 60 / 60);
        remainder -= hours * 60 * 60;
        var minutes = Math.floor(remainder / 60);
        remainder -= minutes * 60;
        var seconds = Math.floor(remainder);
      }

      var days_str = days.toString().padStart(3, "0");
      var hours_str = hours.toString().padStart(2, "0");
      var minutes_str = minutes.toString().padStart(2, "0");
      var seconds_str = seconds.toString().padStart(2, "0");

      if (animate) {
        // one section
        $flipper
          .find(".flipper-d")
          .find(".flipper-digit:eq(0)")
          .attr("data-value", days);
        $flipper
          .find(".flipper-H")
          .find(".flipper-digit:eq(0)")
          .attr("data-value", hours);
        $flipper
          .find(".flipper-i")
          .find(".flipper-digit:eq(0)")
          .attr("data-value", minutes);
        $flipper
          .find(".flipper-s")
          .find(".flipper-digit:eq(0)")
          .attr("data-value", seconds);

        // two sections
        $flipper
          .find(".flipper-dd")
          .find(".flipper-digit:eq(0)")
          .attr("data-value", days_str[1]);
        $flipper
          .find(".flipper-dd")
          .find(".flipper-digit:eq(1)")
          .attr("data-value", days_str[2]);
        $flipper
          .find(".flipper-HH")
          .find(".flipper-digit:eq(0)")
          .attr("data-value", hours_str[0]);
        $flipper
          .find(".flipper-HH")
          .find(".flipper-digit:eq(1)")
          .attr("data-value", hours_str[1]);
        $flipper
          .find(".flipper-ii")
          .find(".flipper-digit:eq(0)")
          .attr("data-value", minutes_str[0]);
        $flipper
          .find(".flipper-ii")
          .find(".flipper-digit:eq(1)")
          .attr("data-value", minutes_str[1]);
        $flipper
          .find(".flipper-ss")
          .find(".flipper-digit:eq(0)")
          .attr("data-value", seconds_str[0]);
        $flipper
          .find(".flipper-ss")
          .find(".flipper-digit:eq(1)")
          .attr("data-value", seconds_str[1]);

        // three sections
        $flipper
          .find(".flipper-ddd")
          .find(".flipper-digit:eq(0)")
          .attr("data-value", days_str[0]);
        $flipper
          .find(".flipper-ddd")
          .find(".flipper-digit:eq(1)")
          .attr("data-value", days_str[1]);
        $flipper
          .find(".flipper-ddd")
          .find(".flipper-digit:eq(2)")
          .attr("data-value", days_str[2]);
      } else {
        $flipper.find(".flipper-group .flipper-digit").removeAttr("data-value");
        $flipper.find(".digit-face.active").removeClass("active");

        // one section
        $flipper
          .find(
            ".flipper-d .flipper-digit:eq(0) .digit-face:contains(" + days + ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-H .flipper-digit:eq(0) .digit-face:contains(" +
              hours +
              ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-i .flipper-digit:eq(0) .digit-face:contains(" +
              minutes +
              ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-s .flipper-digit:eq(0) .digit-face:contains(" +
              seconds +
              ")"
          )
          .addClass("active");

        // two sections
        $flipper
          .find(
            ".flipper-dd .flipper-digit:eq(0) .digit-face:contains(" +
              days_str[1] +
              ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-dd .flipper-digit:eq(1) .digit-face:contains(" +
              days_str[2] +
              ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-HH .flipper-digit:eq(0) .digit-face:contains(" +
              hours_str[0] +
              ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-HH .flipper-digit:eq(1) .digit-face:contains(" +
              hours_str[1] +
              ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-ii .flipper-digit:eq(0) .digit-face:contains(" +
              minutes_str[0] +
              ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-ii .flipper-digit:eq(1) .digit-face:contains(" +
              minutes_str[1] +
              ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-ss .flipper-digit:eq(0) .digit-face:contains(" +
              seconds_str[0] +
              ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-ss .flipper-digit:eq(1) .digit-face:contains(" +
              seconds_str[1] +
              ")"
          )
          .addClass("active");

        // three sections
        $flipper
          .find(
            ".flipper-ddd .flipper-digit:eq(0) .digit-face:contains(" +
              days_str[0] +
              ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-ddd .flipper-digit:eq(1) .digit-face:contains(" +
              days_str[1] +
              ")"
          )
          .addClass("active");
        $flipper
          .find(
            ".flipper-ddd .flipper-digit:eq(2) .digit-face:contains(" +
              days_str[2] +
              ")"
          )
          .addClass("active");
        addAppearance($flipper);
      }
    }
  };

  $(".flipper").flipper("init");
});



const words = [
  "Самая лучшая",
  "Самая красивая",
  "Сладенькая булочка",
  "Прелесть",
  "Зайчик",
  "Кися",
  "Мой воздух",
  "#Босс",
  "Дюймовочка",
  "Белоснежка",
  "Красотка",
  "Милашка",
  "Люблю тебя",
  "#Ты моя жизнь",
  "Мой мир",
  "Потрясающая",
  "Лучшая",
  "Единственная",
  "Прекрасная",
  "Цветочек",
  "Звездочка",
  "Воробушек",
  "Не абюзер",
  "Лешина девочка",
  "Непревзойденная",
  "Ревнивица",
  "Ути пути",
  "Дуняша",
  "Принцесса",
];

const unsortedMemories = [
  {
    img: "./images/Memories/1.jpg",
    description:
      "Начало отношений... Ну как же без отчета, что я на тренировке)",
    date: new Date(2021, 1, 16),
  },
  {
    img: "./images/Memories/2.jpg",
    description:
      "Ну вот и моя первая масочка, как же я был счастлив в тот день",
    date: new Date(2021, 1, 21),
  },
  {
    img: "./images/Memories/3.jpg",
    description:
      "Уехал на соревнования в Солигорск на 4 дня, как же мы тогда скучали...",
    date: new Date(2021, 2, 16),
  },
  {
    img: "./images/Memories/4.jpg",
    description:
      "Готовим шавурменьку, я начал психовать из-за лаваша, ты помогла и все получилось. Спасибо было очень вкусно :)",
    date: new Date(2021, 3, 10),
  },
  {
    img: "./images/Memories/5.jpg",
    description:
      "И опять вместе готовим курочку под ананасом с пюрешкой. У меня уже слюни текут",
    date: new Date(2021, 3, 24),
  },
  {
    img: "./images/Memories/6.jpg",
    description: "Мы не мы без таких фоток",
    date: new Date(2021, 6, 28),
  },
  {
    img: "./images/Memories/7.jpg",
    description: "Зашли в зоо, чуть не вышли с белочкой",
    date: new Date(2021, 7, 6),
  },
  {
    img: "./images/Memories/8.jpg",
    description:
      "Помню приехал к тебе вечером на велосипеде, а на улице было прохладно, ну ты и дала мне свою кофту. Спасибо большое)",
    date: new Date(2021, 7, 11),
  },
  {
    img: "./images/Memories/9.jpg",
    description:
      "Вот и последний день прекрасного лета, мурочка как всегда рада тебя видеть",
    date: new Date(2021, 7, 30),
  },
  {
    img: "./images/Memories/10.jpg",
    description:
      "Первые дни учебы, как же было сложно перестроиться после такого отдыха",
    date: new Date(2021, 8, 6),
  },
  {
    img: "./images/Memories/11.jpg",
    description:
      "Поехали на рынок за подшипником на такси, но кто-то увидел вику возле остановки...",
    date: new Date(2021, 8, 26),
  },
  {
    img: "./images/Memories/12.jpg",
    description: "Только начинаю ездить в автошколе. Дали новый газон",
    date: new Date(2021, 9, 14),
  },
  {
    img: "./images/Memories/13.jpg",
    description:
      "Ну конечено же мой день рождения, 18 лет, уже могу покупать тебе нулёвочку. Спасибо огромное, что в этот день ты была рядом!)",
    date: new Date(2021, 9, 18),
  },
  {
    img: "./images/Memories/14.jpg",
    description: "Еду наводить суету в город, скоро уже сдам на права",
    date: new Date(2021, 10, 11),
  },
  {
    img: "./images/Memories/15.jpg",
    description:
      "Пошли гулять в парк, надо как-то отдохнуть от учебы, ведь и так сколько уже проучились. Устали...",
    date: new Date(2021, 8, 15),
  },
  {
    img: "./images/Memories/16.jpg",
    description:
      "Меряем наряды у тети Тани, кто-то хочет меня убить или съесть)",
    date: new Date(2021, 10, 14),
  },
  {
    img: "./images/Memories/17.jpg",
    description: "Пошли покупать мне куртку и ботики, без тебя бы не выбрал)",
    date: new Date(2021, 10, 20),
  },
  {
    img: "./images/Memories/18.jpg",
    description:
      "Все таки получил права с первого раза, радости полные штаны, теперь катаемся с тобой. АААААААААА это прекрасно",
    date: new Date(2021, 11, 10),
  },
  {
    img: "./images/Memories/20.jpg",
    description:
      "Красивым осенним вечером поехали в Сопоцкино на горы и любовались закатом",
    date: new Date(2021, 08, 18),
  },
  {
    img: "./images/Memories/21.jpg",
    description:
      "Помню до сих пор этот момент когда мы вместе поехали на велосипедах на новый мост и фоткались в разных местах. И как на нас орали мужики с другого берега, ахах...",
    date: new Date(2021, 07, 11),
  },
  {
    img: "./images/Memories/22.jpg",
    description:
      "Ну а это гос экзамен по вождению от Барни, кстати я его прошел) Было классно в каменке с тобой, к слову, каждый раз был такой)",
    date: new Date(2021, 06, 21),
  },
  {
    img: "./images/Memories/23.jpg",
    description: "Кому как, а Леше летом скучно, он учится",
    date: new Date(2021, 05, 06),
  },
  {
    img: "./images/Memories/24.jpg",
    description:
      "Как же прекрасно, когда о тебе могут позаботиться, когда ты болеешь. Спасибо тебе, малыш)",
    date: new Date(2021, 11, 07),
  },
  {
    img: "./images/Memories/25.jpg",
    description:
      "Наконец-то выбрались в гараж на гастрофест. Блюда так себе, но ты как всегда очаровательна)",
    date: new Date(2021, 10, 24),
  },
  {
    img: "./images/Memories/26.jpg",
    description: "Просто дурачимся, чем ещё заниматься студентам?",
    date: new Date(2021, 10, 15),
  },
  {
    img: "./images/Memories/27.jpg",
    description: "Не спрашивайте, нам хорошо",
    date: new Date(2021, 04, 09),
  },
  {
    img: "./images/Memories/28.jpg",
    description: "Самый любовный бусь)",
    date: new Date(2021, 05, 25),
  },
];

const memories = unsortedMemories.sort((a, b) => a.date - b.date);

const CLASTER_WIDTH = 300;
const CLASTER_HEIGHT = 300;


function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

//warning
const warningBtn = document.querySelector(".warning__btn");
const warningPopup = document.querySelector('.warning');
warningBtn.addEventListener('click', (evt) => {
  warningPopup.classList.add('hide');
  document.body.style.overflowY = 'visible';
})
//hidden text
const warningHiddenLink = document.querySelector(".warning__text-link");
const warningHiddenText = document.querySelector(".warning__text-hidden");
warningHiddenLink.addEventListener('click', (evt) => {
  evt.preventDefault();
  warningHiddenText.classList.add('visible');
})

window.addEventListener("load", (evt) => {
  //AOS.init();



  createMemories(memories);

  //Modal gallery
  let curInd = 0;

  const galleryList = document.querySelector(".memories__list");
  const galleryModal = document.querySelector(".gallery-modal");
  const galleryCloseBtn = document.querySelector(".gallery-modal__close");
  const galleryNextBtn = document.querySelector(
    ".gallery-modal__nav-btn--next"
  );
  const galleryPrevBtn = document.querySelector(
    ".gallery-modal__nav-btn--prev"
  );

  galleryList.addEventListener("click", (evt) => {
    const target = evt.target;

    if (!target.closest(".memories__item")) return;

    showModalGallery(target.closest(".memories__item"));
  });

  galleryPrevBtn.addEventListener("click", (evt) => {
    curInd = curInd === 0 ? memories.length - 1 : --curInd;

    updateGalleryModal();
  });

  galleryNextBtn.addEventListener("click", (evt) => {
    curInd = curInd === memories.length - 1 ? 0 : ++curInd;

    updateGalleryModal();
  });

  galleryCloseBtn.addEventListener("click", (evt) => {
    galleryModal.classList.remove("gallery-modal--active");
  });

  function createMemories(memories) {
    const list = document.querySelector(".memories__list");

    const memTmp = document.querySelector(".memories__item-template");
    memories.forEach((mem, index) => {
      const memTmpCopy = memTmp.content.cloneNode(true);

      const li = memTmpCopy.querySelector(".memories__item");
      li.dataset.index = index;

      const img = memTmpCopy.querySelector(".memories__item-img");
      img.src = mem.img;

      list.append(memTmpCopy);
    });
  }

  function showModalGallery(item) {
    curInd = +item.dataset.index;
    
    updateGalleryModal();
    
    galleryModal.classList.add("gallery-modal--active");
  }

  function updateGalleryModal() {
    galleryModal.querySelector(".gallery-modal__img").src =
      memories[curInd].img;

    galleryModal.querySelector(".gallery-modal__text").textContent =
      memories[curInd].description;

    const curDate = memories[curInd].date;
    galleryModal.querySelector(".gallery-modal__date").textContent =
      new Intl.DateTimeFormat("ru-RU", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }).format(curDate);

    galleryModal.querySelector(".gallery-modal__nav-text").textContent =
      +curInd + 1;
  }

  const mainEl = document.querySelector(".main");

  const windowHeight = mainEl.offsetHeight;
  const windowWidth = document.documentElement.clientWidth;

  const wordWrapperEl = document.createElement("div");

  for (let i = 0; i < Math.round(windowWidth / CLASTER_WIDTH); i++) {
    for (let j = 0; j < Math.round(windowHeight / CLASTER_HEIGHT); j++) {
      const word = words[getRandomNum(0, words.length)];

      const wordEl = document.createElement("span");
      wordEl.classList.add("happy-word");
      wordEl.innerHTML = word;

      const rndLeftOffset = getRandomNum(0, CLASTER_WIDTH / 2);
      const rndTopOffset = getRandomNum(0, CLASTER_HEIGHT / 3);

      const rndRotateDeg = getRandomNum(-180, 180);

      wordEl.style.top = `${j * CLASTER_HEIGHT + rndTopOffset}px`;
      wordEl.style.left = `${i * CLASTER_WIDTH + rndLeftOffset}px`;
      wordEl.style.transform = `rotate(${rndRotateDeg}deg)`;

      wordWrapperEl.append(wordEl);
    }
  }

  mainEl.append(wordWrapperEl);

});

