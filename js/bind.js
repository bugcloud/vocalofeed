(function() {
  var Loading, Niconico, Video, VideoList, _loadingView, _nico, _videos;

  Loading = (function() {

    function Loading() {
      this.html = "<style>\n#loadingWrapper {\nbackground:rgba(10,10,10,0.6);\nwidth:100%;\nheight:100%;\nposition:absolute;\ntop:0;\nleft:0;\nz-index:9999;\n}\n\n#bowlG{\nposition:relative;\nwidth:128px;\nheight:128px;\nmargin:0 auto;\n}\n\n#bowl_ringG{\nposition:absolute;\nwidth:128px;\nheight:128px;\nborder:11px solid #FFFFFF;\n-moz-border-radius:128px;\n-webkit-border-radius:128px;\nborder-radius:128px;\n}\n\n.ball_holderG{\nposition:absolute;\nwidth:34px;\nheight:128px;\nleft:47px;\ntop:0px;\n-webkit-animation-name:ball_moveG;\n-webkit-animation-duration:2.5s;\n-webkit-animation-iteration-count:infinite;\n-webkit-animation-timing-function:linear;\n-moz-animation-name:ball_moveG;\n-moz-animation-duration:2.5s;\n-moz-animation-iteration-count:infinite;\n-moz-animation-timing-function:linear;\n-o-animation-name:ball_moveG;\n-o-animation-duration:2.5s;\n-o-animation-iteration-count:infinite;\n-o-animation-timing-function:linear;\n-ms-animation-name:ball_moveG;\n-ms-animation-duration:2.5s;\n-ms-animation-iteration-count:infinite;\n-ms-animation-timing-function:linear;\n}\n\n.ballG{\nposition:absolute;\nleft:0px;\ntop:-30px;\nwidth:51px;\nheight:51px;\nbackground:#FFFFFF;\n-moz-border-radius:43px;\n-webkit-border-radius:43px;\nborder-radius:43px;\n}\n\n@-webkit-keyframes ball_moveG{\n0%{\n-webkit-transform:rotate(0deg)}\n\n100%{\n-webkit-transform:rotate(360deg)}\n\n}\n\n@-moz-keyframes ball_moveG{\n0%{\n-moz-transform:rotate(0deg)}\n\n100%{\n-moz-transform:rotate(360deg)}\n\n}\n\n@-o-keyframes ball_moveG{\n0%{\n-o-transform:rotate(0deg)}\n\n100%{\n-o-transform:rotate(360deg)}\n\n}\n\n@-ms-keyframes ball_moveG{\n0%{\n-ms-transform:rotate(0deg)}\n\n100%{\n-ms-transform:rotate(360deg)}\n\n}\n\n</style>\n<section id=\"loadingWrapper\">\n<div id=\"bowlG\">\n<div id=\"bowl_ringG\">\n<div class=\"ball_holderG\">\n<div class=\"ballG\">\n</div>\n</div>\n</div>\n</div>\n</section>";
    }

    Loading.prototype.show = function() {
      var _that;
      _that = this;
      $("body").append(_that.html);
      return $("#bowlG").css('top', "" + (Math.floor($(window).height() / 2 - 64)) + "px");
    };

    Loading.prototype.hide = function() {
      return $("#loadingWrapper").fadeOut(500, function() {
        return $(this).remove();
      });
    };

    return Loading;

  })();

  Video = (function() {

    function Video(params) {
      this.title = params.title != null ? params.title : null;
      this.link = params.link != null ? params.link : null;
      this.id = params.id != null ? params.id : null;
      this.published = params.published != null ? params.published : null;
      this.updated = params.updated != null ? params.updated : null;
      this.content = params.content != null ? params.content : null;
      this.youtube_search = params.title != null ? encodeURI("http://www.youtube.com/results?search_query=" + (params.title.replace(/第[0-9０-９]+位(：|:)/, ""))) : null;
    }

    Video.prototype.toHtml = function() {
      var c, cc, html, imgSrc, nicoThumb, tmp;
      imgSrc = $(this.content).find('img:first').attr('src');
      c = $(this.content);
      nicoThumb = c.find('img:first').attr('src', 'img/loading.png').attr('data-original', imgSrc).addClass('lazy');
      nicoThumb.wrap("<a href='player.html?id=" + this.id + "' target='_blank'>");
      tmp = "<div></div>";
      cc = $(tmp).append(c).html();
      html = "<section class='item clearfix'>\n  <div class='item_content clearfix'>\n    <h1><a href='" + this.link + "' target='_blank'>" + this.title + "</a></h1>\n    " + cc + "\n  </div>\n  <div class='item_extra'>\n    <a href='" + this.youtube_search + "' target='_blank'>YouTube Search</a>\n  </div>\n</section>";
      return html;
    };

    return Video;

  })();

  VideoList = (function() {

    function VideoList() {
      this.list = [];
    }

    VideoList.prototype.clear = function() {
      return this.list = [];
    };

    return VideoList;

  })();

  Niconico = (function() {

    function Niconico() {
      this.type = "daily";
      this.dataCache = {
        daily: null,
        weekly: null,
        monthly: null
      };
    }

    Niconico.prototype.feed = function() {
      return "feed/" + this.type + ".xml";
    };

    Niconico.prototype.getCache = function() {
      return eval("this.dataCache." + this.type);
    };

    Niconico.prototype.setCache = function(data) {
      return eval("this.dataCache." + this.type + " = data");
    };

    Niconico.prototype.hasCached = function() {
      var c;
      c = eval("this.dataCache." + this.type);
      return c !== null;
    };

    Niconico.prototype.fetch = function(callback, beforeRequest) {
      var _that;
      _that = this;
      if (typeof before === "undefined" || before === null) {
        beforeRequest = this.defaultBeforeRequest;
      }
      if (callback == null) callback = this.defaultCallback;
      beforeRequest.call();
      if (_that.hasCached()) {
        return callback.call(this, _that.getCache());
      } else {
        return $.ajax(this.feed(), {
          cache: true,
          type: 'GET',
          data: {
            rss: 'atom'
          },
          dataType: 'xml',
          success: function(data, status) {
            _that.setCache(data);
            return callback.call(this, data);
          },
          error: function(request, status, error) {
            return console.log(error);
          }
        });
      }
    };

    Niconico.prototype.fetchDaily = function(callback) {
      this.type = "daily";
      return this.fetch(callback);
    };

    Niconico.prototype.fetchWeekly = function(callback) {
      this.type = "weekly";
      return this.fetch(callback);
    };

    Niconico.prototype.fetchMontyly = function(callback) {
      this.type = "monthly";
      return this.fetch(callback);
    };

    Niconico.prototype.defaultCallback = function(data) {
      var intervalAll, intervalScroll, itemsAreVisible;
      itemsAreVisible = $(".item:visible").size() > 0;
      intervalAll = itemsAreVisible ? 2100 : 1;
      intervalScroll = itemsAreVisible ? 350 : 1;
      _loadingView.hide();
      return $('html, body').animate({
        scrollTop: 0
      }, intervalScroll, function() {
        var i, target;
        target = $("#main");
        if (itemsAreVisible) {
          i = 0;
          $(".item:lt(6)").each(function() {
            var _that;
            _that = this;
            i += 400;
            return setTimeout(function() {
              $(_that).addClass('slide-out');
              return setTimeout(function() {
                return $(_that).css('opacity', 0);
              }, 700);
            }, i);
          });
        }
        return setTimeout(function() {
          var count, interval, v, _i, _len, _ref;
          target.html("");
          count = 0;
          _videos.clear();
          $(data).find('entry').each(function() {
            var id, params, video;
            count++;
            if (count > 100) return false;
            id = $(this).find('id').text().trim();
            id = id.substr(id.indexOf('sm'));
            params = {
              title: $(this).find('title').text().trim(),
              link: $(this).find('link').attr('href'),
              id: id,
              published: $(this).find('published').text().trim(),
              updated: $(this).find('updated').text().trim(),
              content: $(this).find('content').text().trim()
            };
            video = new Video(params);
            return _videos.list.push(video);
          });
          _ref = _videos.list;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            v = _ref[_i];
            target.append(v.toHtml());
          }
          interval = 0;
          $(".item:lt(6)").each(function() {
            var _that;
            interval += 400;
            _that = this;
            $(_that).find("img.lazy").lazyload({
              effect: "fadeIn"
            });
            return setTimeout(function() {
              $(_that).addClass('slide-in');
              return $(_that).css('opacity', 1);
            }, interval);
          });
          return setTimeout(function() {
            $(".item").css('opacity', 1);
            return $("img.lazy").lazyload();
          }, interval + 400);
        }, intervalAll);
      });
    };

    Niconico.prototype.defaultBeforeRequest = function() {
      return _loadingView.show();
    };

    return Niconico;

  })();

  _nico = new Niconico();

  _videos = new VideoList();

  _loadingView = new Loading();

  $(function() {
    _nico.fetch();
    return $(".link_ranking").on('click', function() {
      var type;
      $(".active").removeClass("active");
      $(this).parent().addClass("active");
      type = $(this).data("ranking-type");
      if (type === "daily") {
        return _nico.fetchDaily();
      } else if (type === "weekly") {
        return _nico.fetchWeekly();
      } else if (type === "monthly") {
        return _nico.fetchMontyly();
      }
    });
  });

}).call(this);
