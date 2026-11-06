/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * Upload-Adapter, der Dateien (z. B. Bilder) per XHR an den IROIN-Server hochlädt.
 *
 * Konfiguration über `config.iroinUpload`, siehe {@link IroinUploadConfig}.
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { FileRepository, type FileLoader, type UploadAdapter, type UploadResponse } from '@ckeditor/ckeditor5-upload';
import { logWarning } from '@ckeditor/ckeditor5-utils';

export type IroinUploadHeaders = Record<string, string>;

export interface IroinUploadConfig {

	/**
	 * Endpunkt, an den die Datei per `POST` (multipart/form-data) geschickt wird.
	 */
	uploadUrl: string;

	/**
	 * Name des Formularfelds, das die Datei enthält. Standard: `'file'`.
	 */
	fieldName?: string;

	/**
	 * Zusätzliche Request-Header. Kann ein Objekt oder eine (async) Funktion sein, die bei jedem
	 * Upload neu aufgerufen wird – z. B. um einen aktuellen Bearer-Token zu liefern.
	 */
	headers?: IroinUploadHeaders | ( () => IroinUploadHeaders | Promise<IroinUploadHeaders> );

	/**
	 * Setzt `XMLHttpRequest.withCredentials`. Standard: `false`.
	 */
	withCredentials?: boolean;

	/**
	 * Wandelt die (JSON-)Antwort des Servers in die Bild-URL um. Gibt entweder einen String (URL)
	 * oder ein {@link UploadResponse}-Objekt (z. B. `{ default: '…', '800': '…' }` für srcset) zurück.
	 * Standard: `response => response.url`.
	 */
	getUrlFromResponse?: ( response: any ) => string | UploadResponse | undefined | null;
}

export default class IroinUploadAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ FileRepository ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'IroinUploadAdapter' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const options = this.editor.config.get( 'iroinUpload' );

		if ( !options ) {
			return;
		}

		if ( !options.uploadUrl ) {
			logWarning( 'iroin-upload-adapter-missing-uploadurl' );

			return;
		}

		this.editor.plugins.get( FileRepository ).createUploadAdapter = loader => new Adapter( loader, options );
	}
}

/**
 * Upload-Adapter für eine einzelne Datei.
 */
export class Adapter implements UploadAdapter {
	public loader: FileLoader;
	public options: IroinUploadConfig;

	private xhr?: XMLHttpRequest;
	private aborted = false;

	constructor( loader: FileLoader, options: IroinUploadConfig ) {
		this.loader = loader;
		this.options = options;
	}

	/**
	 * @see module:upload/filerepository~UploadAdapter#upload
	 */
	public async upload(): Promise<UploadResponse> {
		const file = await this.loader.file;
		const headers = await resolveHeaders( this.options.headers );

		// Der Upload kann abgebrochen worden sein, während auf Datei oder Header gewartet wurde.
		if ( this.aborted ) {
			return Promise.reject();
		}

		return new Promise( ( resolve, reject ) => {
			const xhr = this.xhr = new XMLHttpRequest();

			xhr.open( 'POST', this.options.uploadUrl, true );
			xhr.responseType = 'json';
			xhr.withCredentials = !!this.options.withCredentials;

			for ( const [ name, value ] of Object.entries( headers ) ) {
				xhr.setRequestHeader( name, value );
			}

			const genericErrorText = `Couldn't upload file: ${ file!.name }.`;

			xhr.addEventListener( 'error', () => reject( genericErrorText ) );
			xhr.addEventListener( 'abort', () => reject() );
			xhr.addEventListener( 'load', () => {
				const response = xhr.response;

				if ( xhr.status >= 400 || !response || response.error ) {
					return reject( response && response.error && response.error.message ? response.error.message : genericErrorText );
				}

				let result: string | UploadResponse | undefined | null;

				try {
					const mapResponse = this.options.getUrlFromResponse || ( ( r: any ) => r.url );

					result = mapResponse( response );
				} catch ( err ) {
					return reject( genericErrorText );
				}

				if ( !result ) {
					return reject( genericErrorText );
				}

				resolve( typeof result === 'string' ? { default: result } : result );
			} );

			if ( xhr.upload ) {
				xhr.upload.addEventListener( 'progress', evt => {
					if ( evt.lengthComputable ) {
						this.loader.uploadTotal = evt.total;
						this.loader.uploaded = evt.loaded;
					}
				} );
			}

			const data = new FormData();

			data.append( this.options.fieldName || 'file', file! );

			xhr.send( data );
		} );
	}

	/**
	 * @see module:upload/filerepository~UploadAdapter#abort
	 */
	public abort(): void {
		this.aborted = true;

		if ( this.xhr ) {
			this.xhr.abort();
		}
	}
}

async function resolveHeaders( headers: IroinUploadConfig[ 'headers' ] ): Promise<IroinUploadHeaders> {
	if ( !headers ) {
		return {};
	}

	if ( typeof headers === 'function' ) {
		return ( await headers() ) || {};
	}

	return headers;
}
