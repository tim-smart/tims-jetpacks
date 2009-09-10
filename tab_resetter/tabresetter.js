/*
 * A random mash-up exploring tabs in Jetpack
 * 
 * (cc) Creative Commons BY-NC-SA License
 * (c) Tim Smart 2009
 */

/*
 * URL: String
 * User defined constant that determine what URL to keep open
 */
const URL = 'http://www.google.com/';

/*
 * EXPIRE_TIME: Number
 * User defined constant that deterines in SECONDS the time to reset tabs to URL
 */
const EXPIRE_TIME = 1 * 60 * 60; // Hours * Minutes * Seconds

/*
 * tabResetter: Object
 * Constains the instance of TabResetter
 */
var tabResetter = null;

/*
 * Attachs status bar element
 */
jetpack.statusBar.append({
	html: '<span id="status" style="color: red; font-size: 10px; cursor: pointer; line-height: 20px;">Off</div>',
	width: 40,
	onReady: function( doc ) {
		doc.getElementById('status').addEventListener( 'click', function() {
			if ( tabResetter !== null ) {
				tabResetter.stop();
				tabResetter = null;

				this.textContent = 'Off';
				this.style.color = 'red';
			} else {
				tabResetter = new TabResetter({
					url: URL,
					expires: EXPIRE_TIME,
					statusElement: this
				});

				this.textContent = 'On';
				this.style.color = 'green';
			}
		}, false );
	}
});

/*
 * msToTimeString: Function
 * Turns milliseconds into h:m:s
 *
 * @param	ms	[Number]
 */
function msToTimeString( ms ) {
	ms = Math.floor( ms / 1000 );
	var array = [ Math.floor( ms / ( 60 * 60 ) ) ];
	ms = ms - ( array[0] * 60 * 60 );

	array[1] = Math.floor( ms / 60 );
	if ( 1 >= array[1].toString().length )
		array[1] = '0' + array[1];

	array[2] = ms - ( array[1] * 60 );
	if ( 1 >= array[2].toString().length )
		array[2] = '0' + array[2];

	return array.join(':');
}

/*
 * TabResetter: constructor
 * 
 * @param	options	[Object]
 * 			Configures the basic setting of the TabResetter constructor
 */
var TabResetter = function() {
	this.construct.apply( this, arguments );
};

TabResetter.prototype = {
	/*
	 * construct: Function
	 * Initiates the TabResetter constructor
	 */
	construct: function( options ) {
		this.options = options;
		if ( typeof options.url !== 'string' )
			return;

		this.url = options.url;
		this.options.expires = typeof options.expires === 'number' ? options.expires : this.expires;
		this.expires = new Date().getTime() + 1000 * this.options.expires;
		this.statusElement = options.statusElement || null;
		this.exec();
		this.watch();
	},

	/*
	 * options: Object
	 * Contains the user entered options
	 */
	options: {},

	/*
	 * timeout: Number
	 * Contains reference to the timeout
	 */
	timeout: null,

	/*
	 * url: String
	 * URL to open in new tab
	 */
	url: '',

	/*
	 * expires: Number
	 * Timestamp of when to reset tabs
	 */
	expires: 60 * 60,

	/*
	 * finished: Boolean
	 * Keeps record of state
	 */
	finished: false,

	/*
	 * statusElement: HTMLElement
	 * Reference to where counter text will go
	 */
	statusElement: null,

	/*
	 * watch: Function
	 * Main loop
	 */
	watch: function() {
		var time = new Date().getTime();

		if ( this.statusElement !== null )
			this.statusElement.textContent = msToTimeString( this.expires - time );

		if ( time >= this.expires ) {
			this.exec();
			return;
		}

		var fn = this;
		this.timeout = setTimeout( function() {
			if ( fn.finished === true )
				return;

			fn.watch.call( fn );
		}, 1000 );
	},

	/*
	 * exec: Function
	 * Opens the tab and re-enters loop
	 */
	exec: function() {
		var tabs = [];
		for ( var i = 0, il = jetpack.tabs.length; i < il; i++ )
			tabs.push( jetpack.tabs[ i ] );

		jetpack.tabs.open( this.url );

		for ( i = 0, il = tabs.length; i < il; i++ )
			tabs[ i ].close();

		this.expires = new Date().getTime() + 1000 * this.options.expires;
		this.watch();
	},

	/*
	 * stop: Function
	 * Clears the loop and stops execution
	 */
	stop: function() {
		this.finished = true;
		clearTimeout( this.timeout );
	}
};
