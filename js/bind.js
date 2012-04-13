var Niconico, Video, VideoList, _nico, _videos;

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
    var html;
    html = "<section class='item clearfix'>\n  <div class='item_content clearfix'>\n    <h1><a href='" + this.link + "'>" + this.title + "</a></h1>\n    " + this.content + "\n  </div>\n  <div class='item_extra'>\n    <a href='" + this.youtube_search + "'>Search in YouTube</a>\n  </div>\n</section>";
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
  }

  Niconico.prototype.feed = function() {
    return "feed/" + this.type + ".xml";
  };

  Niconico.prototype.fetch = function(callback) {
    if (callback == null) callback = this.defaultCallback;
    return $.ajax(this.feed(), {
      cache: true,
      type: 'GET',
      data: {
        rss: 'atom'
      },
      dataType: 'xml',
      success: function(data, status) {
        return callback.call(this, data);
      },
      error: function(request, status, error) {
        return console.log(error);
      }
    });
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
    var count, target, v, _i, _len, _ref;
    target = $("#main");
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
    return $(".item").fadeIn(800);
  };

  return Niconico;

})();

_nico = new Niconico();

_videos = new VideoList();

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
