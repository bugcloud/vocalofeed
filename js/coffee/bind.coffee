class Loading
  constructor: () ->
    @html = """
<style>
#loadingWrapper {
background:rgba(10,10,10,0.6);
width:100%;
height:100%;
position:absolute;
top:0;
left:0;
z-index:9999;
}

#bowlG{
position:relative;
width:128px;
height:128px;
margin:0 auto;
}

#bowl_ringG{
position:absolute;
width:128px;
height:128px;
border:11px solid #FFFFFF;
-moz-border-radius:128px;
-webkit-border-radius:128px;
border-radius:128px;
}

.ball_holderG{
position:absolute;
width:34px;
height:128px;
left:47px;
top:0px;
-webkit-animation-name:ball_moveG;
-webkit-animation-duration:2.5s;
-webkit-animation-iteration-count:infinite;
-webkit-animation-timing-function:linear;
-moz-animation-name:ball_moveG;
-moz-animation-duration:2.5s;
-moz-animation-iteration-count:infinite;
-moz-animation-timing-function:linear;
-o-animation-name:ball_moveG;
-o-animation-duration:2.5s;
-o-animation-iteration-count:infinite;
-o-animation-timing-function:linear;
-ms-animation-name:ball_moveG;
-ms-animation-duration:2.5s;
-ms-animation-iteration-count:infinite;
-ms-animation-timing-function:linear;
}

.ballG{
position:absolute;
left:0px;
top:-30px;
width:51px;
height:51px;
background:#FFFFFF;
-moz-border-radius:43px;
-webkit-border-radius:43px;
border-radius:43px;
}

@-webkit-keyframes ball_moveG{
0%{
-webkit-transform:rotate(0deg)}

100%{
-webkit-transform:rotate(360deg)}

}

@-moz-keyframes ball_moveG{
0%{
-moz-transform:rotate(0deg)}

100%{
-moz-transform:rotate(360deg)}

}

@-o-keyframes ball_moveG{
0%{
-o-transform:rotate(0deg)}

100%{
-o-transform:rotate(360deg)}

}

@-ms-keyframes ball_moveG{
0%{
-ms-transform:rotate(0deg)}

100%{
-ms-transform:rotate(360deg)}

}

</style>
<section id="loadingWrapper">
<div id="bowlG">
<div id="bowl_ringG">
<div class="ball_holderG">
<div class="ballG">
</div>
</div>
</div>
</div>
</section>
    """

  show: () ->
    _that = this
    $("body").append _that.html
    $("#bowlG").css('top', "#{Math.floor( $(window).height()/2 - 64 )}px")
  hide: () ->
    $("#loadingWrapper").fadeOut 500, () ->
      $(this).remove()

class Video
  constructor: (params) ->
    @title = if params.title? then params.title else null
    @link = if params.link? then params.link else null
    @id = if params.id? then params.id else null
    @published = if params.published? then params.published else null
    @updated = if params.updated? then params.updated else null
    @content = if params.content? then params.content else null
    @youtube_search = if params.title? then encodeURI("http://www.youtube.com/results?search_query=#{params.title.replace(/第[0-9０-９]+位(：|:)/, "")}") else null
  toHtml: () ->
    imgSrc = $(@content).find('img:first').attr('src')
    c = $(@content)
    nicoThumb = c.find('img:first').attr('src', 'img/loading.png').attr('data-original', imgSrc).addClass('lazy')
    nicoThumb.wrap "<a href='player.html?id=#{@id}' target='_blank'>"

    tmp = "<div></div>"
    cc = $(tmp).append(c).html()
    html = """
      <section class='item clearfix'>
        <div class='item_content clearfix'>
          <h1><a href='#{@link}' target='_blank'>#{@title}</a></h1>
          #{cc}
        </div>
        <div class='item_extra'>
          <a href='#{@youtube_search}' target='_blank'>YouTube Search</a>
        </div>
      </section>
    """
    html

class VideoList
  constructor: () ->
    @list = []
  clear: () ->
    @list = []

class Niconico
  constructor: () ->
    @type = "daily"
    @dataCache =
      daily: null
      weekly: null
      monthly: null
  feed: () ->
    "feed/#{@type}.xml"
  getCache: () ->
    eval("this.dataCache.#{@type}")
  setCache: (data) ->
    eval("this.dataCache.#{@type} = data")
  hasCached: () ->
    c = eval("this.dataCache.#{@type}")
    c isnt null
  fetch: (callback, beforeRequest) ->
    _that = this
    unless before?
      beforeRequest = this.defaultBeforeRequest
    unless callback?
      callback = this.defaultCallback
    beforeRequest.call()
    if _that.hasCached()
      callback.call(this, _that.getCache())
    else
      $.ajax this.feed(),
        cache: false,
        type: 'GET',
        data: {rss: 'atom'},
        dataType: 'xml',
        success: (data, status) ->
          _that.setCache(data)
          callback.call(this, data)
        error: (request, status, error) ->
          console.log error

  fetchDaily: (callback) ->
    @type = "daily"
    this.fetch(callback)

  fetchWeekly: (callback) ->
    @type = "weekly"
    this.fetch(callback)

  fetchMontyly: (callback) ->
    @type = "monthly"
    this.fetch(callback)

  defaultCallback: (data) ->
    itemsAreVisible = $(".item:visible").size() > 0
    intervalAll = if itemsAreVisible then 2100 else 1
    intervalScroll = if itemsAreVisible then 350 else 1
    _loadingView.hide()
    $('html, body').animate {scrollTop: 0}, intervalScroll, () ->
      target = $("#main")

      if itemsAreVisible
        i = 0
        $(".item:lt(6)").each () ->
          _that = this
          i += 400
          setTimeout () ->
            $(_that).addClass('slide-out')
            setTimeout () ->
              $(_that).css('opacity', 0)
            , 700
          , i

      setTimeout () ->
        target.html ""
        count = 0
        _videos.clear()
        $(data).find('entry').each ()->
          count++
          return false if count > 100
          id = $(this).find('id').text().trim()
          id = id.substr(id.indexOf('sm'))
          params = {
            title: $(this).find('title').text().trim()
            link: $(this).find('link').attr('href')
            id: id
            published: $(this).find('published').text().trim()
            updated: $(this).find('updated').text().trim()
            content: $(this).find('content').text().trim()
          }
          video = new Video(params)
          _videos.list.push video
        for v in _videos.list
          target.append v.toHtml()
        interval = 0
        $(".item:lt(6)").each () ->
          interval += 400
          _that = this
          setTimeout () ->
            $(_that).addClass('slide-in')
            $(_that).css('opacity', 1)
          , interval
        setTimeout () ->
          $(".item").css('opacity', 1)
          $("img.lazy").lazyload()
        ,(interval + 400)
      , intervalAll

  defaultBeforeRequest: () ->
    _loadingView.show()

_nico = new Niconico()
_videos = new VideoList()
_loadingView = new Loading()

$ ->
  _nico.fetch()
  $(".link_ranking").on 'click', () ->
    $(".active").removeClass("active")
    $(this).parent().addClass("active")
    type = $(this).data("ranking-type")
    if type is "daily"
      _nico.fetchDaily()
    else if type is "weekly"
      _nico.fetchWeekly()
    else if type is "monthly"
      _nico.fetchMontyly()
