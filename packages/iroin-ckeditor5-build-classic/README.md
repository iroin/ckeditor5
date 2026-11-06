CKEditor&nbsp;5 classic editor build
========================================

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-build-classic.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5?branch=master)
[![Build Status](https://travis-ci.com/ckeditor/ckeditor5.svg?branch=master)](https://app.travis-ci.com/github/ckeditor/ckeditor5)

The classic editor build for CKEditor&nbsp;5. Read more about the [classic editor build](https://ckeditor.com/docs/ckeditor5/latest/getting-started/legacy/installation-methods/predefined-builds.html#classic-editor) and see the [demo](https://ckeditor.com/docs/ckeditor5/latest/examples/builds/classic-editor.html).

![CKEditor&nbsp;5 classic editor build screenshot](https://c.cksource.com/a/1/img/npm/ckeditor5-build-classic.png)

## Documentation

See:

* [Installation](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start.html) for how to install this package and what it contains.
* [Editor lifecycle](https://ckeditor.com/docs/ckeditor5/latest/installation/legacy/getting-started/editor-lifecycle.html) for how to create an editor and interact with it.
* [Configuration](https://ckeditor.com/docs/ckeditor5/latest/getting-started/setup/configuration.html) for how to configure the editor.
* [Creating custom builds](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start.html#building-the-editor-from-source) for how to customize the build (configure and rebuild the editor bundle).

## Quick start

First, install the build from npm:

```bash
npm install --save @ckeditor/ckeditor5-build-classic
```

And use it in your website:

```html
<div id="editor">
	<p>This is the editor content.</p>
</div>
<script src="./node_modules/@ckeditor/ckeditor5-build-classic/build/ckeditor.js"></script>
<script>
	ClassicEditor
		.create( document.querySelector( '#editor' ) )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( error => {
			console.error( 'There was a problem initializing the editor.', error );
		} );
</script>
```

Or in your JavaScript application:

```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Or using the CommonJS version:
// const ClassicEditor = require( '@ckeditor/ckeditor5-build-classic' );

ClassicEditor
	.create( document.querySelector( '#editor' ) )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( error => {
		console.error( 'There was a problem initializing the editor.', error );
	} );
```

**Note:** If you are planning to integrate CKEditor&nbsp;5 deep into your application, it is actually more convenient and recommended to install and import the source modules directly (like it happens in `ckeditor.js`). Read more in the [Advanced setup guide](https://ckeditor.com/docs/ckeditor5/latest/getting-started/legacy/advanced/alternative-setups/integrating-from-source-webpack.html).

## Bild-Upload (IROIN)

Der Build enthält den `IroinUploadAdapter`. Sobald `iroinUpload.uploadUrl` gesetzt ist, können Nutzer Bilder hochladen (Toolbar-Button, Drag & Drop, Einfügen aus der Zwischenablage). Die Datei wird als `multipart/form-data` per `POST` an den Server geschickt. Ohne Konfiguration funktioniert weiterhin nur das Einfügen per URL.

```js
ClassicEditor.create( document.querySelector( '#editor' ), {
	iroinUpload: {
		// Pflicht: Endpunkt für den Upload.
		uploadUrl: '/api/files',

		// Optional: Name des Formularfelds mit der Datei (Standard: 'file').
		fieldName: 'file',

		// Optional: Header als Objekt oder (async) Funktion. Die Funktion wird bei jedem Upload neu
		// aufgerufen, so wird immer der aktuelle (ggf. erneuerte) Token verwendet.
		headers: async () => ( { Authorization: `Bearer ${ await getAccessToken() }` } ),

		// Optional: Cookies mitsenden (Standard: false).
		withCredentials: false,

		// Optional: Bild-URL aus der JSON-Antwort ermitteln (Standard: response => response.url).
		// Darf auch ein Objekt zurückgeben, z. B. { default: '…', 800: '…' } für responsive Bilder.
		getUrlFromResponse: response => response.data.url
	}
} );
```

Erwartete Server-Antwort (JSON):

* Erfolg (Status < 400): ein Objekt, aus dem `getUrlFromResponse` die URL liest, standardmäßig `{ "url": "https://…/bild.jpg" }`.
* Fehler (Status ≥ 400 oder `error`-Feld): `{ "error": { "message": "…" } }`. Die Meldung wird dem Nutzer angezeigt. Ohne Meldung erscheint ein generischer Text.

## License

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the `LICENSE.md` file or [https://ckeditor.com/legal/ckeditor-oss-license](https://ckeditor.com/legal/ckeditor-oss-license).
