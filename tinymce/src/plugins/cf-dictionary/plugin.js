(function () {
    var cfDictionary = (function () {
        'use strict';

        tinymce.PluginManager.add("cfDictionary", function (editor, url) {

            /*
            Add a custom icon to TinyMCE
             */
            editor.ui.registry.addIcon('bubbles', '<svg width="24" height="24"><use xlink:href="custom-icons.svg#bubbles4"></use></svg>');

            /*
            Use to store the instance of the Dialog
             */
            var _dialog = false;

            /*
            An array of options to appear in the "Type" select box.
             */
            var _typeOptions = [];

            /**
             * Get the Dialog Configuration Object
             *
             * @returns {{buttons: *[], onSubmit: onSubmit, title: string, body: {}}}
             * @private
             */
            function _getDialogConfig()
            {
                return {
                    title: 'Insert dictionary item',
                    body: {
                        type: 'panel',
                        items: [{
                            type: 'selectbox',
                            name: 'type',
                            label: 'Dropdown',
                            items: _typeOptions,
                            flex: true
                        }]
                    },
                    onSubmit: function (api) {
                        var parts = api.getData().type.split("###");

                        // insert markup
                        editor.insertContent('<div class="cms-dictionary"><span class="cms-dictionary-preview">' + parts[1] + '</span><span class="cms-dictionary-edit">{{ cfdictionary "' + parts[0] + '" "' + parts[1] + '" }}</span></div>');

                        // close the dialog
                        api.close();
                    },
                    buttons: [
                        {
                            text: 'Close',
                            type: 'cancel',
                            onclick: 'close'
                        },
                        {
                            text: 'Insert',
                            type: 'submit',
                            primary: true,
                            enabled: false
                        }
                    ]
                };
            }

            function toggleShowPreview () {
                var dom = editor.dom;
                dom.toggleClass(editor.getBody(), 'dictionary-preview');
            };

            /**
             * Plugin behaviour for when the Toolbar or Menu item is selected
             *
             * @private
             */
            function _onAction()
            {
                // Open a Dialog, and update the dialog instance var
                _dialog = editor.windowManager.open(_getDialogConfig());

                // block the Dialog, and commence the data update
                // Message is used for accessibility
                _dialog.block('Loading...');

                // Do a server call to get the items for the select box
				var contentfulClient = contentful.createClient({
				  accessToken: 'aJDaYDHmvaIcdsgIZ3cehVQDkyezeRXHqH82bRizLIE',
				  space: '463tg7igak4f'
				});

				var ct = 'dictionary';

				contentfulClient.getEntries({
					content_type: ct,
					limit: 1000
				}).then(function(entries) {
					_typeOptions = [];
					
					entries.items.forEach( function( item ) {
						var t = item.fields.key;
						var v = item.fields.value;
						
						_typeOptions.push( { text: t, value: t + "###" + v } );
					});

                    // re-build the dialog
                    _dialog.redial(_getDialogConfig());

                    // unblock the dialog
                    _dialog.unblock();
				});
            }

            // Define the Toolbar button
            editor.ui.registry.addButton('cfDictionary', {
                text: "Dictionary",
                onAction: _onAction
            });

            editor.ui.registry.addToggleButton('cfTogglePreview', {
                icon: 'bubbles',
                onAction: function (api) {
                    console.log( "toggleShowPreview");
                    toggleShowPreview();
                    api.setActive(!api.isActive());
                },
                onSetup: function (api) {                    
                }
            });

            // Define the Menu Item
            editor.ui.registry.addMenuItem('cfDictionary', {
                text: 'Dictionary',
                context: 'insert',
                icon: 'bubbles',
                onAction: _onAction
            });            

            // Return details to be displayed in TinyMCE's "Help" plugin, if you use it
            // This is optional.
            return {
                getMetadata: function () {
                    return {
                        name: "Contentful Dictionary",
                        url: "https://www.written4.com"
                    };
                }
            };
        });
    }());
})();