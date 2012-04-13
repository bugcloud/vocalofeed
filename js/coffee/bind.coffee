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
    html = """
      <section class='item clearfix'>
        <div class='item_content clearfix'>
          <h1><a href='#{@link}'>#{@title}</a></h1>
          #{@content}
        </div>
        <div class='item_extra'>
          <a href='#{@youtube_search}'>Search in YouTube</a>
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
  feed: () ->
    "feed/#{@type}.xml"
  fetch: (callback) ->
    unless callback?
      callback = this.defaultCallback
    $.ajax this.feed(),
      cache: true,
      type: 'GET',
      data: {rss: 'atom'},
      dataType: 'xml',
      success: (data, status) ->
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
    target = $("#main")
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
    $(".item").fadeIn(800)

_nico = new Niconico()
_videos = new VideoList()

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
