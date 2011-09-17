

if(typeof(Control) == "undefined")
	Control = {};
lightbox = Class.create();
Object.extend(lightbox,{
	loaded: false,
	loading: false,
	loadingTimeout: false,
	overlay: false,
	container: false,
	current: false,
	ie: false,
	effects: {
		containerFade: false,
		containerAppear: false,
		overlayFade: false,
		overlayAppear: false
	},
	targetRegexp: /#(.+)$/,
	imgRegexp: /\.(jpe?g|gif|png|tiff?)$/i,
	overlayStyles: {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		zIndex: 9998
	},
	overlayIEStyles: {
		position: 'absolute',
		top: 0,
		left: 0,
		zIndex: 9998
	},
	disableHoverClose: false,
	load: function(){
		if(!lightbox.loaded){
			lightbox.loaded = true;
			lightbox.ie = !(typeof document.body.style.maxHeight != 'undefined');
			lightbox.overlay = $(document.createElement('div'));
			lightbox.overlay.id = 'lightbox_overlay';
			Object.extend(lightbox.overlay.style,lightbox['overlay' + (lightbox.ie ? 'IE' : '') + 'Styles']);
			lightbox.overlay.hide();
			lightbox.container = $(document.createElement('div'));
			lightbox.container.id = 'lightbox_container';
			lightbox.container.hide();
			lightbox.loading = $(document.createElement('div'));
			lightbox.loading.id = 'lightbox_loading';
			lightbox.loading.hide();
			var body_tag = document.getElementsByTagName('body')[0];
			body_tag.appendChild(lightbox.overlay);
			body_tag.appendChild(lightbox.container);
			body_tag.appendChild(lightbox.loading);
			lightbox.container.observe('mouseout',function(event){
				if(!lightbox.disableHoverClose && lightbox.current && lightbox.current.options.hover && !Position.within(lightbox.container,Event.pointerX(event),Event.pointerY(event)))
					lightbox.close();
			});
		}
	},
	open: function(contents,options){
		options = options || {};
		if(!options.contents)
			options.contents = contents;
		var lightbox_instance = new lightbox(false,options);
		lightbox_instance.open();
		return lightbox_instance;
	},
	close: function(force){
		if(typeof(force) != 'boolean')
			force = false;
		if(lightbox.current)
			lightbox.current.close(force);
	},
	attachEvents: function(){
		//Event.observe(window,'load',lightbox.load);
		//Event.observe(window,'unload',Event.unloadCache,false);
    
  	document.observe('contentloaded', lightbox.load);  
		
	//Above commented two lines are modified by document.observe to fix the issue ----- handler has no properties
	},
	center: function(element){
		if(!element._absolutized){
			element.setStyle({
				position: 'absolute'
			}); 
			element._absolutized = true;
		}
		var dimensions = element.getDimensions();
		Position.prepare();
		var offset_left = (Position.deltaX + Math.floor((lightbox.getWindowWidth() - dimensions.width) / 2));
		var offset_top = (Position.deltaY + ((lightbox.getWindowHeight() > dimensions.height) ? Math.floor((lightbox.getWindowHeight() - dimensions.height) / 2) : 0));
		element.setStyle({
			top: ((dimensions.height <= lightbox.getDocumentHeight()) ? ((offset_top != null && offset_top > 0) ? offset_top : '0') + 'px' : 0),
			left: ((dimensions.width <= lightbox.getDocumentWidth()) ? ((offset_left != null && offset_left > 0) ? offset_left : '0') + 'px' : 0)
		});
	},
	getWindowWidth: function(){
		return (self.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0);
	},
	getWindowHeight: function(){
		return (self.innerHeight ||  document.documentElement.clientHeight || document.body.clientHeight || 0);
	},
	getDocumentWidth: function(){
		return Math.min(document.body.scrollWidth,lightbox.getWindowWidth());
	},
	getDocumentHeight: function(){
		return Math.max(document.body.scrollHeight,lightbox.getWindowHeight());
	},
	onKeyDown: function(event){
		if(event.keyCode == Event.KEY_ESC)
			lightbox.close();
	}
});
Object.extend(lightbox.prototype,{
	mode: '',
	html: false,
	href: '',
	element: false,
	src: false,
	imageLoaded: false,
	ajaxRequest: false,
	initialize: function(element,options){
		this.element = $(element);
		this.options = {
			beforeOpen: Prototype.emptyFunction,
			afterOpen: Prototype.emptyFunction,
			beforeClose: Prototype.emptyFunction,
			afterClose: Prototype.emptyFunction,
			onSuccess: Prototype.emptyFunction,
			onFailure: Prototype.emptyFunction,
			onException: Prototype.emptyFunction,
			beforeImageLoad: Prototype.emptyFunction,
			afterImageLoad: Prototype.emptyFunction,
			autoOpenIfLinked: true,
			contents: false,
			loading: false, //display loading indicator
			fade: false,
			fadeDuration: 0.75,
			image: false,
			imageCloseOnClick: true,
			hover: false,
			iframe: false,
			iframeTemplate: new Template('<iframe src="#{href}" width="100%" height="100%" frameborder="0" id="#{id}"></iframe>'),
			evalScripts: true, //for Ajax, define here instead of in requestOptions
			requestOptions: {}, //for Ajax.Request
			overlayDisplay: true,
			overlayClassName: '',
			overlayCloseOnClick: false,
			containerClassName: '',
			opacity: 0.3,
			zIndex: 9998,
			width: null,
			height: null,
			method: 'post',
			offsetLeft: 0, //for use with 'relative'
			offsetTop: 0, //for use with 'relative'
			position: 'absolute' //'absolute' or 'relative'
			
		};
		Object.extend(this.options,options || {});
		var target_match = false;
		var image_match = false;
		if(this.element){
			target_match = lightbox.targetRegexp.exec(this.element.href);
			image_match = lightbox.imgRegexp.exec(this.element.href);
		}
		if(this.options.position == 'mouse')
			this.options.hover = true;
		if(this.options.contents){
			this.mode = 'contents';
		}else if(this.options.image || image_match){
			this.mode = 'image';
			this.src = this.element.href;
		}else if(target_match){
			this.mode = 'named';
			var x = $(target_match[1]);
			this.html = x.innerHTML;
			x.remove();
			this.href = target_match[1];
		}else{
			this.mode = (this.options.iframe) ? 'iframe' : 'ajax';
			this.href = this.element.href;
		}
		if(this.element){
			if(this.options.hover){
				this.element.observe('mouseover',this.open.bind(this));
				this.element.observe('mouseout',function(event){
					if(!Position.within(lightbox.container,Event.pointerX(event),Event.pointerY(event)))
						this.close();
				}.bindAsEventListener(this));
			}else{
				this.element.onclick = function(event){
					this.open();
					Event.stop(event);
					return false;
				}.bindAsEventListener(this);
			}
		}
		var targets = lightbox.targetRegexp.exec(window.location);
		this.position = function(event){
			if(this.options.position == 'absolute')
				lightbox.center(lightbox.container);
			else{
				var xy = (event && this.options.position == 'mouse' ? [Event.pointerX(event),Event.pointerY(event)] : Position.cumulativeOffset(this.element));
				lightbox.container.setStyle({
					position: 'absolute',
					top: xy[1] + (typeof(this.options.offsetTop) == 'function' ? this.options.offsetTop() : this.options.offsetTop) + 'px',
					left: xy[0] + (typeof(this.options.offsetLeft) == 'function' ? this.options.offsetLeft() : this.options.offsetLeft) + 'px'
				});
			}
			if(lightbox.ie){
				lightbox.overlay.setStyle({
					height: lightbox.getDocumentHeight() + 'px',
					width: lightbox.getDocumentWidth() + 'px'
				});
			}
		}.bind(this);
		if(this.mode == 'named' && this.options.autoOpenIfLinked && targets && targets[1] && targets[1] == this.href)
			this.open();
	},
	showLoadingIndicator: function(){
		if(this.options.loading){
			lightbox.loadingTimeout = window.setTimeout(function(){
				var lightbox_image = $('lightbox_image');
				if(lightbox_image)
					lightbox_image.hide();
				lightbox.loading.style.zIndex = this.options.zIndex + 1;
				lightbox.loading.update('<img id="lightbox_loading" src="' + this.options.loading + '"/>');
				lightbox.loading.show();
				lightbox.center(lightbox.loading);
			}.bind(this),250);
		}
	},
	hideLoadingIndicator: function(){
		if(this.options.loading){
			if(lightbox.loadingTimeout)
				window.clearTimeout(lightbox.loadingTimeout);
			var lightbox_image = $('lightbox_image');
			if(lightbox_image)
				lightbox_image.show();
			lightbox.loading.hide();
		}
	},
	open: function(force){
		if(!force && this.notify('beforeOpen') === false)
			return;
		if(!lightbox.loaded)
			lightbox.load();
		lightbox.close();
		if(!this.options.hover)
			Event.observe($(document.getElementsByTagName('body')[0]),'keydown',lightbox.onKeyDown);
		lightbox.current = this;
		if(!this.options.hover)
			lightbox.overlay.setStyle({
				zIndex: this.options.zIndex,
				opacity: this.options.opacity
			});
		lightbox.container.setStyle({
			zIndex: this.options.zIndex + 1,
			width: (this.options.width ? (typeof(this.options.width) == 'function' ? this.options.width() : this.options.width) + 'px' : null),
			height: (this.options.height ? (typeof(this.options.height) == 'function' ? this.options.height() : this.options.height) + 'px' : null)
		});
		if(lightbox.ie && !this.options.hover){
			$A(document.getElementsByTagName('select')).each(function(select){
				select.style.visibility = 'hidden';
			});
		}
		lightbox.overlay.addClassName(this.options.overlayClassName);
		lightbox.container.addClassName(this.options.containerClassName);
		switch(this.mode){
			case 'image':
				this.imageLoaded = false;
				this.notify('beforeImageLoad');
				this.showLoadingIndicator();
				var img = document.createElement('img');
				img.onload = function(img){
					this.hideLoadingIndicator();
					this.update([img]);
					if(this.options.imageCloseOnClick)
						$(img).observe('click',lightbox.close);
					this.position();
					this.notify('afterImageLoad');
					img.onload = null;
				}.bind(this,img);
				img.src = this.src;
				img.id = 'lightbox_image';
				break;
			case 'ajax':
				this.notify('beforeLoad');
				var options = {
					method: this.options.method,
					onSuccess: function(request){
						this.hideLoadingIndicator();
						this.update(request.responseText);
						this.notify('onSuccess',request);
						this.ajaxRequest = false;
					}.bind(this),
					onFailure: function(){
						this.notify('onFailure');
					}.bind(this),
					onException: function(){
						this.notify('onException');
					}.bind(this)
				};
				Object.extend(options,this.options.requestOptions);
				this.showLoadingIndicator();
				this.ajaxRequest = new Ajax.Request(this.href,options);
				break;
			case 'iframe':
				this.update(this.options.iframeTemplate.evaluate({href: this.href, id: 'lightbox_iframe'}));
				break;
			case 'contents':
				this.update((typeof(this.options.contents) == 'function' ? this.options.contents() : this.options.contents));
				break;
			case 'named':
				this.update(this.html);
				break;
		}
		if(!this.options.hover){
			if(this.options.overlayCloseOnClick && this.options.overlayDisplay)
				lightbox.overlay.observe('click',lightbox.close);
			if(this.options.overlayDisplay){
				if(this.options.fade){
					if(lightbox.effects.overlayFade)
						lightbox.effects.overlayFade.cancel();
					lightbox.effects.overlayAppear = new Effect.Appear(lightbox.overlay,{
						queue: {
							position: 'front',
							scope: 'lightbox'
						},
						to: this.options.opacity,
						duration: this.options.fadeDuration / 2
					});
				}else
					lightbox.overlay.show();
			}
		}
		if(this.options.position == 'mouse'){
			this.mouseHoverListener = this.position.bindAsEventListener(this);
			this.element.observe('mousemove',this.mouseHoverListener);
		}
		this.notify('afterOpen');
	},
	update: function(html){
		if(typeof(html) == 'string')
			lightbox.container.update(html);
		else{
			lightbox.container.update('');
			(html.each) ? html.each(function(node){
				lightbox.container.appendChild(node);
			}) : lightbox.container.appendChild(node);
		}
		if(this.options.fade){
			if(lightbox.effects.containerFade)
				lightbox.effects.containerFade.cancel();
			lightbox.effects.containerAppear = new Effect.Appear(lightbox.container,{
				queue: {
					position: 'end',
					scope: 'lightbox'
				},
				to: 1,
				duration: this.options.fadeDuration / 2
			});
		}else
			lightbox.container.show();
		this.position();
		Event.observe(window,'resize',this.position,false);
		Event.observe(window,'scroll',this.position,false);
	},
	close: function(force){
		if(!force && this.notify('beforeClose') === false)
			return;
		if(this.ajaxRequest)
			this.ajaxRequest.transport.abort();
		this.hideLoadingIndicator();	
		if(this.mode == 'image'){
			var lightbox_image = $('lightbox_image');
			if(this.options.imageCloseOnClick && lightbox_image)
				lightbox_image.stopObserving('click',lightbox.close);
		}
		if(lightbox.ie && !this.options.hover){
			$A(document.getElementsByTagName('select')).each(function(select){
				select.style.visibility = 'visible';
			});			
		}
		if(!this.options.hover)
			Event.stopObserving(window,'keyup',lightbox.onKeyDown);
		lightbox.current = false;
		Event.stopObserving(window,'resize',this.position,false);
		Event.stopObserving(window,'scroll',this.position,false);
		if(!this.options.hover){
			if(this.options.overlayCloseOnClick && this.options.overlayDisplay)
				lightbox.overlay.stopObserving('click',lightbox.close);
			if(this.options.overlayDisplay){
				if(this.options.fade){
					if(lightbox.effects.overlayAppear)
						lightbox.effects.overlayAppear.cancel();
					lightbox.effects.overlayFade = new Effect.Fade(lightbox.overlay,{
						queue: {
							position: 'end',
							scope: 'lightbox'
						},
						from: this.options.opacity,
						to: 0,
						duration: this.options.fadeDuration / 2
					});
				}else
					lightbox.overlay.hide();
			}
		}
		if(this.options.fade){
			if(lightbox.effects.containerAppear)
				lightbox.effects.containerAppear.cancel();
			lightbox.effects.containerFade = new Effect.Fade(lightbox.container,{
				queue: {
					position: 'front',
					scope: 'lightbox'
				},
				from: 1,
				to: 0,
				duration: this.options.fadeDuration / 2,
				afterFinish: function(){
					lightbox.container.update('');
					this.resetClassNameAndStyles();
				}.bind(this)
			});
		}else{
			lightbox.container.hide();
			lightbox.container.update('');
			this.resetClassNameAndStyles();
		}
		if(this.options.position == 'mouse')
			this.element.stopObserving('mousemove',this.mouseHoverListener);
		this.notify('afterClose');
	},
	resetClassNameAndStyles: function(){
		lightbox.overlay.removeClassName(this.options.overlayClassName);
		lightbox.container.removeClassName(this.options.containerClassName);
		lightbox.container.setStyle({
			height: null,
			width: null,
			top: null,
			left: null
		});
	},
	notify: function(event_name){
		try{
			if(this.options[event_name])
				return [this.options[event_name].apply(this.options[event_name],$A(arguments).slice(1))];
		}catch(e){
			if(e != $break)
				throw e;
			else
				return false;
		}
	}
});
if(typeof(Object.Event) != 'undefined')
	Object.Event.extend(lightbox);
lightbox.attachEvents();


