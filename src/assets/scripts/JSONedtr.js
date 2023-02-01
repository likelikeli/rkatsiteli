function JSONedtr( data, outputElement, config = {} ){

	if (! window.jQuery) {
        console.error("JSONedtr requires jQuery");
        return;
    }

	var JSONedtr = {};

	JSONedtr.config = config;

	if( JSONedtr.config.instantChange == null  )
		JSONedtr.config.instantChange = true ;

	JSONedtr.level = function ( node, lvl=0 ) {
		var output = '';
		$.each( node , function( key, value ) {
			JSONedtr.i++;
			if( typeof key == 'string' )
				key = key.replace(/\"/g,"&quot;");

			if( typeof value == 'object' ) {
				var type = typeof value;

				if( Array.isArray( value ) )
					type = 'array';

				output += '<div class="jse--row jse--row--array" id="jse--row-' + JSONedtr.i + '"><input type="text" class="jse--key jse--array" data-level="' + lvl + '" value="' + key + '"> : <span class="jse--typeof">(' + type + ')</span>';
				output += JSONedtr.level( value, lvl+1 );
				output += '<div class="jse--setting" data-bs-toggle="modal" data-bs-target="#exampleModal"><svg class="icon" width="1.5em" height="1.5em" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#1296db" d="M439.264 208a16 16 0 0 0-16 16v67.968a239.744 239.744 0 0 0-46.496 26.896l-58.912-34a16 16 0 0 0-21.856 5.856l-80 138.56a16 16 0 0 0 5.856 21.856l58.896 34a242.624 242.624 0 0 0 0 53.728l-58.88 34a16 16 0 0 0-6.72 20.176l0.848 1.68 80 138.56a16 16 0 0 0 21.856 5.856l58.912-34a239.744 239.744 0 0 0 46.496 26.88V800a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-67.968a239.744 239.744 0 0 0 46.512-26.896l58.912 34a16 16 0 0 0 21.856-5.856l80-138.56a16 16 0 0 0-4.288-20.832l-1.568-1.024-58.896-34a242.624 242.624 0 0 0 0-53.728l58.88-34a16 16 0 0 0 6.72-20.176l-0.848-1.68-80-138.56a16 16 0 0 0-21.856-5.856l-58.912 34a239.744 239.744 0 0 0-46.496-26.88V224a16 16 0 0 0-16-16h-160z m32 48h96v67.376l28.8 12.576c13.152 5.76 25.632 12.976 37.184 21.52l25.28 18.688 58.448-33.728 48 83.136-58.368 33.68 3.472 31.2a194.624 194.624 0 0 1 0 43.104l-3.472 31.2 58.368 33.68-48 83.136-58.432-33.728-25.296 18.688c-11.552 8.544-24.032 15.76-37.184 21.52l-28.8 12.576V768h-96v-67.376l-28.784-12.576c-13.152-5.76-25.632-12.976-37.184-21.52l-25.28-18.688-58.448 33.728-48-83.136 58.368-33.68-3.472-31.2a194.624 194.624 0 0 1 0-43.104l3.472-31.2-58.368-33.68 48-83.136 58.432 33.728 25.296-18.688a191.744 191.744 0 0 1 37.184-21.52l28.8-12.576V256z m47.28 144a112 112 0 1 0 0 224 112 112 0 0 0 0-224z m0 48a64 64 0 1 1 0 128 64 64 0 0 1 0-128z" /></svg></div>'
				if(lvl!=0){
					output+='<div class="jse--delete">✖</div></div>';
				}
			} else {
				if( typeof value == 'string' )
					value = value.replace(/\"/g,"&quot;");
				output += '<div class="jse--row" id="jse--row-' + JSONedtr.i + '"><input type="text" class="jse--key" data-level="' + lvl + '" value="' + key + '"> : <span class="jse--typeof">(' + typeof value + ')</span><input type="text" class="jse--value" value="' + value + '" data-key="' + key + '">' +
					'<div class="jse--setting" data-bs-toggle="modal" data-bs-target="#exampleModal"><svg class="icon" width="1.5em" height="1.5em" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#1296db" d="M439.264 208a16 16 0 0 0-16 16v67.968a239.744 239.744 0 0 0-46.496 26.896l-58.912-34a16 16 0 0 0-21.856 5.856l-80 138.56a16 16 0 0 0 5.856 21.856l58.896 34a242.624 242.624 0 0 0 0 53.728l-58.88 34a16 16 0 0 0-6.72 20.176l0.848 1.68 80 138.56a16 16 0 0 0 21.856 5.856l58.912-34a239.744 239.744 0 0 0 46.496 26.88V800a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-67.968a239.744 239.744 0 0 0 46.512-26.896l58.912 34a16 16 0 0 0 21.856-5.856l80-138.56a16 16 0 0 0-4.288-20.832l-1.568-1.024-58.896-34a242.624 242.624 0 0 0 0-53.728l58.88-34a16 16 0 0 0 6.72-20.176l-0.848-1.68-80-138.56a16 16 0 0 0-21.856-5.856l-58.912 34a239.744 239.744 0 0 0-46.496-26.88V224a16 16 0 0 0-16-16h-160z m32 48h96v67.376l28.8 12.576c13.152 5.76 25.632 12.976 37.184 21.52l25.28 18.688 58.448-33.728 48 83.136-58.368 33.68 3.472 31.2a194.624 194.624 0 0 1 0 43.104l-3.472 31.2 58.368 33.68-48 83.136-58.432-33.728-25.296 18.688c-11.552 8.544-24.032 15.76-37.184 21.52l-28.8 12.576V768h-96v-67.376l-28.784-12.576c-13.152-5.76-25.632-12.976-37.184-21.52l-25.28-18.688-58.448 33.728-48-83.136 58.368-33.68-3.472-31.2a194.624 194.624 0 0 1 0-43.104l3.472-31.2-58.368-33.68 48-83.136 58.432 33.728 25.296-18.688a191.744 191.744 0 0 1 37.184-21.52l28.8-12.576V256z m47.28 144a112 112 0 1 0 0 224 112 112 0 0 0 0-224z m0 48a64 64 0 1 1 0 128 64 64 0 0 1 0-128z" /></svg></div>'

				if(lvl!=0){
					output+='<div class="jse--delete">✖</div></div>';
				}

			}
		})
		if(lvl!=0){
			output += '<div class="jse--row jse--add" data-level="' + lvl + '"><button class="jse--plus">✚</button></div>';

		}

		return output;
	}

	JSONedtr.getData = function( node = $( JSONedtr.outputElement + ' > .jse--row > input' ) ){
		var result = {};
		$.each( node, function() {

			if( $(this).hasClass( 'jse--value' ) ) {
				result[ $(this).data( 'key' ) ] = $(this).val();
			}

			if( $(this).hasClass( 'jse--object' ) || $(this).hasClass( 'jse--array' ) ) {
				var selector = '#' + $(this).parent().attr('id') + ' > .jse--row > input';
				result[ $(this).val( ) ] = JSONedtr.getData( $( selector ) );
			}
		});
		return result;
	}

	JSONedtr.getDataString = function( node = $( JSONedtr.outputElement + ' > .jse--row > input' ) ){
		return JSON.stringify( JSONedtr.getData() );
	}

	JSONedtr.addRowForm = function( plus ) {
		var lvl = $( plus ).data('level');
		// TODO: add support for array, reference and number
		var typeofHTML = '<select class="jse--typeof">'+
							'<option value="object" selected="selected">Object</option>'+
							'<option value="array">Array</option>'+
							'<option value="string">String</option>'+
							'<option value="boolean">Boolean</option>'+
							'<option value="number">Number</option>'+
							'<option value="integer">Integer</option>'+
						'</select>';

		$( plus ).html('<input type="text" class="jse--key" data-level="' + lvl + '" value=""> : <span class="jse--typeof">( ' + typeofHTML + ' )</span><input type="text" class="jse--value jse--value__new" value=""><button class="jse--save">Save</button><button class="jse--cancel">Cancel</button>');
		$( plus ).children('.jse--key').focus();

		$( plus ).find( 'select.jse--typeof' ).change(function(){
			switch ( $(this).val() ) {
				case 'string':
					$(this).parent().siblings( '.jse--value__new' ).replaceWith( '<input type="text" class="jse--value jse--value__new" value="">' );
					$(this).parent().siblings( '.jse--value__new' ).focus();
					break;
				case 'number':
					$(this).parent().siblings( '.jse--value__new' ).replaceWith( '<input type="text" class="jse--value jse--value__new" value="">' );
					$(this).parent().siblings( '.jse--value__new' ).focus();
					break;
				case 'integer':
					$(this).parent().siblings( '.jse--value__new' ).replaceWith( '<input type="text" class="jse--value jse--value__new" value="">' );
					$(this).parent().siblings( '.jse--value__new' ).focus();
					break;
				case 'boolean':
					$(this).parent().siblings( '.jse--value__new' ).replaceWith( '<input type="checkbox" class="jse--value jse--value__new" value="">' );
					$(this).parent().siblings( '.jse--value__new' ).focus();
					break;
				case 'object':
					$(this).parent().siblings( '.jse--value__new' ).replaceWith( '<span class="jse--value__new"></span>' );
					break;
				case 'array':
					$(this).parent().siblings( '.jse--value__new' ).replaceWith( '<span class="jse--value__new"></span>' );
					break;
			}
		})

		$( '.jse--row.jse--add .jse--save' ).click(function( e ){
			JSONedtr.addRow( e.currentTarget.parentElement )
		})

		$( '.jse--row.jse--add .jse--cancel' ).click(function( e ){
			var x = e.currentTarget.parentElement
			$( e.currentTarget.parentElement ).html('<button class="jse--plus">✚</button>');
			$( x ).find( '.jse--plus' ).click( function(e){
				JSONedtr.addRowForm( e.currentTarget.parentElement );
			});
		})
	}

	JSONedtr.addRow = function( row ) {

		var typeOf = $( row ).find( 'select.jse--typeof option:selected' ).val();
		var ii = $( JSONedtr.outputElement ).data('i');
		ii++;
		$( JSONedtr.outputElement ).data('i', ii);
		var lvl = $( row ).data('level');
		$( row ).removeClass( 'jse--add' ).attr('id', 'jse--row-' + ii );
		$( row ).find( 'span.jse--typeof' ).html('(' + typeOf +')');
		var key = $( row ).find( '.jse--key' ).val()
		switch ( typeOf ) {
			case 'string':
				$( row ).find( '.jse--value__new' ).data( 'key', key ).removeClass( 'jse--value__new' );
				break;
			case 'integer':
				$( row ).find( '.jse--value__new' ).data( 'key', key ).removeClass( 'jse--value__new' );
				break;
			case 'number':
				$( row ).find( '.jse--value__new' ).data( 'key', key ).removeClass( 'jse--value__new' );
				break;
			case 'boolean':
				if ($( row ).find( '.jse--value__new' ).is(':checked')) {
					$( row ).find( '.jse--value__new' ).replaceWith( '<input type="text" class="jse--value" value="true" data-key="' + key + '">' );
				} else {
					$( row ).find( '.jse--value__new' ).replaceWith( '<input type="text" class="jse--value" value="false" data-key="' + key + '">' );
				}
				break;
			case 'object':
				$( row ).find( '.jse--key' ).addClass( 'jse--object' );
				$( row ).append( '<div class="xxx jse--row jse--add" data-level="' + (lvl + 1) + '"><button class="jse--plus">✚</button></div>' );
				$( row ).addClass( 'jse--row-object' );
				break;
			case 'array':
				$( row ).find( '.jse--key' ).addClass( 'jse--object' );
				$( row ).append( '<div class="xxx jse--row jse--add" data-level="' + (lvl + 1) + '"><button class="jse--plus">✚</button></div>' );
				$( row ).addClass( 'jse--row-object' );
				break;
		}

		$( row ).append('<div class="jse--setting" data-bs-toggle="modal" data-bs-target="#exampleModal"><svg class="icon" width="1.5em" height="1.5em" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#1296db" d="M439.264 208a16 16 0 0 0-16 16v67.968a239.744 239.744 0 0 0-46.496 26.896l-58.912-34a16 16 0 0 0-21.856 5.856l-80 138.56a16 16 0 0 0 5.856 21.856l58.896 34a242.624 242.624 0 0 0 0 53.728l-58.88 34a16 16 0 0 0-6.72 20.176l0.848 1.68 80 138.56a16 16 0 0 0 21.856 5.856l58.912-34a239.744 239.744 0 0 0 46.496 26.88V800a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-67.968a239.744 239.744 0 0 0 46.512-26.896l58.912 34a16 16 0 0 0 21.856-5.856l80-138.56a16 16 0 0 0-4.288-20.832l-1.568-1.024-58.896-34a242.624 242.624 0 0 0 0-53.728l58.88-34a16 16 0 0 0 6.72-20.176l-0.848-1.68-80-138.56a16 16 0 0 0-21.856-5.856l-58.912 34a239.744 239.744 0 0 0-46.496-26.88V224a16 16 0 0 0-16-16h-160z m32 48h96v67.376l28.8 12.576c13.152 5.76 25.632 12.976 37.184 21.52l25.28 18.688 58.448-33.728 48 83.136-58.368 33.68 3.472 31.2a194.624 194.624 0 0 1 0 43.104l-3.472 31.2 58.368 33.68-48 83.136-58.432-33.728-25.296 18.688c-11.552 8.544-24.032 15.76-37.184 21.52l-28.8 12.576V768h-96v-67.376l-28.784-12.576c-13.152-5.76-25.632-12.976-37.184-21.52l-25.28-18.688-58.448 33.728-48-83.136 58.368-33.68-3.472-31.2a194.624 194.624 0 0 1 0-43.104l3.472-31.2-58.368-33.68 48-83.136 58.432 33.728 25.296-18.688a191.744 191.744 0 0 1 37.184-21.52l28.8-12.576V256z m47.28 144a112 112 0 1 0 0 224 112 112 0 0 0 0-224z m0 48a64 64 0 1 1 0 128 64 64 0 0 1 0-128z" /></svg></div>');
		$( row ).append( '<div class="jse--delete">✖</div>' );

		$( row ).find( '.jse--delete' ).click(function( e ){
			JSONedtr.deleteRow( e.currentTarget.parentElement );
		})

		$( row ).children( '.jse--save, .jse--cancel' ).remove();
		$( row ).after( '<div class="jse--row jse--add" data-level="' + lvl + '"><button class="jse--plus">✚</button></div>' );
		$( row ).parent().find( '.jse--row.jse--add .jse--plus' ).click( function(e){ JSONedtr.addRowForm( e.currentTarget.parentElement ) });

		$( row ).find( 'input' ).on( 'change input', function( e ){
			if ( JSONedtr.config.runFunctionOnUpdate ) {
				if( JSONedtr.config.instantChange || 'change' == e.type )
					JSONedtr.executeFunctionByName( JSONedtr.config.runFunctionOnUpdate , window, JSONedtr);
			}
		});

		if ( JSONedtr.config.runFunctionOnUpdate ) {
			JSONedtr.executeFunctionByName( JSONedtr.config.runFunctionOnUpdate , window, JSONedtr);
		}

	}

	JSONedtr.deleteRow = function( row ) {
		$( row ).remove();
		if ( JSONedtr.config.runFunctionOnUpdate ) {
			JSONedtr.executeFunctionByName( JSONedtr.config.runFunctionOnUpdate , window, JSONedtr);
		}
	}

	JSONedtr.executeFunctionByName = function(functionName, context /*, args */) {
		var args = Array.prototype.slice.call(arguments, 2);
		var namespaces = functionName.split(".");
		var func = namespaces.pop();
		for(var i = 0; i < namespaces.length; i++) {
			context = context[namespaces[i]];
		}
		return context[func].apply(context, args);
	}

	JSONedtr.init = function( data, outputElement ) {
		data = JSON.parse( data );
		JSONedtr.i = 0;
		JSONedtr.outputElement = outputElement;
		var html = JSONedtr.level( data );

		$( outputElement ).addClass('jse--output').html( html ).data('i', JSONedtr.i);

		$( outputElement + ' .jse--row.jse--add .jse--plus' ).click(function( e ){
			JSONedtr.addRowForm( e.currentTarget.parentElement );
		})

		$( outputElement + ' .jse--row .jse--delete' ).click(function( e ){
			JSONedtr.deleteRow( e.currentTarget.parentElement );
		})

		$( outputElement + ' .jse--row input' ).on( 'change input', function( e ){
			if ( JSONedtr.config.runFunctionOnUpdate ) {
				if( JSONedtr.config.instantChange || 'change' == e.type )
					JSONedtr.executeFunctionByName( JSONedtr.config.runFunctionOnUpdate , window, JSONedtr);
			}
		});
	}

	JSONedtr.init( data, outputElement );

	return JSONedtr;
};
