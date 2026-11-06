/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console, setTimeout, File */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { FileRepository } from '@ckeditor/ckeditor5-upload';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import IroinUploadAdapter from '../src/iroinuploadadapter.js';

describe( 'IroinUploadAdapter', () => {
	let editorElement, sinonXHR, consoleWarnStub;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		sinonXHR = testUtils.sinon.useFakeServer();
		consoleWarnStub = testUtils.sinon.stub( console, 'warn' );
	} );

	afterEach( () => {
		sinonXHR.restore();
		editorElement.remove();
	} );

	function createEditor( iroinUpload ) {
		return ClassicTestEditor.create( editorElement, {
			plugins: [ IroinUploadAdapter ],
			iroinUpload
		} );
	}

	function createLoader( editor ) {
		const file = new File( [ 'foo' ], 'image.jpeg', { type: 'image/jpeg' } );

		return editor.plugins.get( FileRepository ).createLoader( file );
	}

	// The adapter resolves the file and the headers asynchronously before the request is opened.
	function waitForRequest() {
		return new Promise( resolve => setTimeout( () => resolve( sinonXHR.requests[ sinonXHR.requests.length - 1 ] ), 0 ) );
	}

	function respondJson( request, status, body ) {
		request.respond( status, { 'Content-Type': 'application/json' }, JSON.stringify( body ) );
	}

	it( 'should require the FileRepository plugin', () => {
		expect( IroinUploadAdapter.requires ).to.deep.equal( [ FileRepository ] );
	} );

	it( 'should be named', () => {
		expect( IroinUploadAdapter.pluginName ).to.equal( 'IroinUploadAdapter' );
	} );

	describe( 'init()', () => {
		it( 'should not register an adapter if not configured', async () => {
			const editor = await createEditor( undefined );

			expect( editor.plugins.get( FileRepository ) ).to.not.have.property( 'createUploadAdapter' );

			await editor.destroy();
		} );

		it( 'should warn and not register an adapter if uploadUrl is missing', async () => {
			const editor = await createEditor( { fieldName: 'foo' } );

			expect( consoleWarnStub.callCount ).to.equal( 1 );
			expect( consoleWarnStub.firstCall.args[ 0 ] ).to.match( /^iroin-upload-adapter-missing-uploadurl/ );
			expect( editor.plugins.get( FileRepository ) ).to.not.have.property( 'createUploadAdapter' );

			await editor.destroy();
		} );

		it( 'should register an adapter if configured', async () => {
			const editor = await createEditor( { uploadUrl: 'http://example.com/upload' } );

			expect( editor.plugins.get( FileRepository ).createUploadAdapter ).to.be.a( 'function' );

			await editor.destroy();
		} );
	} );

	describe( 'upload()', () => {
		let editor, loader;

		afterEach( () => editor.destroy() );

		async function startUpload( config ) {
			editor = await createEditor( config );
			loader = createLoader( editor );

			const adapter = editor.plugins.get( FileRepository ).createUploadAdapter( loader );
			const uploadPromise = adapter.upload();
			const request = await waitForRequest();

			return { adapter, uploadPromise, request };
		}

		it( 'should POST the file in the "file" field to uploadUrl and map { url }', async () => {
			const { uploadPromise, request } = await startUpload( { uploadUrl: 'http://example.com/upload' } );

			expect( request.method ).to.equal( 'POST' );
			expect( request.url ).to.equal( 'http://example.com/upload' );
			expect( request.requestBody.get( 'file' ) ).to.be.instanceOf( File );
			expect( request.withCredentials ).to.be.false;

			respondJson( request, 200, { url: 'http://example.com/image.jpeg' } );

			expect( await uploadPromise ).to.deep.equal( { default: 'http://example.com/image.jpeg' } );
		} );

		it( 'should use a custom fieldName and withCredentials', async () => {
			const { uploadPromise, request } = await startUpload( {
				uploadUrl: 'http://example.com/upload',
				fieldName: 'upload',
				withCredentials: true
			} );

			expect( request.requestBody.get( 'upload' ) ).to.be.instanceOf( File );
			expect( request.requestBody.has( 'file' ) ).to.be.false;
			expect( request.withCredentials ).to.be.true;

			respondJson( request, 200, { url: 'http://example.com/image.jpeg' } );
			await uploadPromise;
		} );

		it( 'should send static headers', async () => {
			const { uploadPromise, request } = await startUpload( {
				uploadUrl: 'http://example.com/upload',
				headers: { Authorization: 'Bearer static' }
			} );

			expect( request.requestHeaders.Authorization ).to.equal( 'Bearer static' );

			respondJson( request, 200, { url: 'x' } );
			await uploadPromise;
		} );

		it( 'should call an async headers function for every upload', async () => {
			let counter = 0;
			const headers = testUtils.sinon.spy( async () => ( { Authorization: `Bearer token-${ ++counter }` } ) );

			const first = await startUpload( { uploadUrl: 'http://example.com/upload', headers } );

			expect( first.request.requestHeaders.Authorization ).to.equal( 'Bearer token-1' );
			respondJson( first.request, 200, { url: 'x' } );
			await first.uploadPromise;

			const adapter = editor.plugins.get( FileRepository ).createUploadAdapter( createLoader( editor ) );
			const secondPromise = adapter.upload();
			const secondRequest = await waitForRequest();

			expect( secondRequest.requestHeaders.Authorization ).to.equal( 'Bearer token-2' );
			respondJson( secondRequest, 200, { url: 'y' } );
			await secondPromise;

			expect( headers.calledTwice ).to.be.true;
		} );

		it( 'should use getUrlFromResponse returning a string', async () => {
			const { uploadPromise, request } = await startUpload( {
				uploadUrl: 'http://example.com/upload',
				getUrlFromResponse: response => response.data.location
			} );

			respondJson( request, 201, { data: { location: 'http://cdn.example.com/a.jpeg' } } );

			expect( await uploadPromise ).to.deep.equal( { default: 'http://cdn.example.com/a.jpeg' } );
		} );

		it( 'should pass through an object returned by getUrlFromResponse', async () => {
			const urls = { default: 'http://example.com/a.jpeg', 800: 'http://example.com/a-800.jpeg' };
			const { uploadPromise, request } = await startUpload( {
				uploadUrl: 'http://example.com/upload',
				getUrlFromResponse: () => urls
			} );

			respondJson( request, 200, {} );

			expect( await uploadPromise ).to.deep.equal( urls );
		} );

		it( 'should reject with the server error message', async () => {
			const { uploadPromise, request } = await startUpload( { uploadUrl: 'http://example.com/upload' } );

			respondJson( request, 413, { error: { message: 'File too large' } } );

			await expectRejection( uploadPromise, 'File too large' );
		} );

		it( 'should reject with a generic message on a 401 without body', async () => {
			const { uploadPromise, request } = await startUpload( { uploadUrl: 'http://example.com/upload' } );

			request.respond( 401, {}, '' );

			await expectRejection( uploadPromise, 'Couldn\'t upload file: image.jpeg.' );
		} );

		it( 'should reject with a generic message if no url can be extracted', async () => {
			const { uploadPromise, request } = await startUpload( { uploadUrl: 'http://example.com/upload' } );

			respondJson( request, 200, { foo: 'bar' } );

			await expectRejection( uploadPromise, 'Couldn\'t upload file: image.jpeg.' );
		} );

		it( 'should reject with a generic message if getUrlFromResponse throws', async () => {
			const { uploadPromise, request } = await startUpload( {
				uploadUrl: 'http://example.com/upload',
				getUrlFromResponse: response => response.data.url
			} );

			respondJson( request, 200, { url: 'x' } );

			await expectRejection( uploadPromise, 'Couldn\'t upload file: image.jpeg.' );
		} );

		it( 'should reject on a network error', async () => {
			const { uploadPromise, request } = await startUpload( { uploadUrl: 'http://example.com/upload' } );

			request.error();

			await expectRejection( uploadPromise, 'Couldn\'t upload file: image.jpeg.' );
		} );

		it( 'should abort the request', async () => {
			const { adapter, uploadPromise, request } = await startUpload( { uploadUrl: 'http://example.com/upload' } );
			const abortSpy = testUtils.sinon.spy( request, 'abort' );

			adapter.abort();

			expect( abortSpy.calledOnce ).to.be.true;
			await expectRejection( uploadPromise, undefined );
		} );

		it( 'should not send a request if aborted before the headers were resolved', async () => {
			editor = await createEditor( {
				uploadUrl: 'http://example.com/upload',
				headers: () => new Promise( resolve => setTimeout( () => resolve( {} ), 10 ) )
			} );

			const adapter = editor.plugins.get( FileRepository ).createUploadAdapter( createLoader( editor ) );
			const uploadPromise = adapter.upload();

			adapter.abort();

			await expectRejection( uploadPromise, undefined );
			expect( sinonXHR.requests ).to.have.length( 0 );
		} );

		it( 'should update the loader progress', async () => {
			const { uploadPromise, request } = await startUpload( { uploadUrl: 'http://example.com/upload' } );

			request.uploadProgress( { loaded: 4, total: 10 } );

			expect( loader.uploaded ).to.equal( 4 );
			expect( loader.uploadTotal ).to.equal( 10 );

			respondJson( request, 200, { url: 'x' } );
			await uploadPromise;
		} );
	} );

	async function expectRejection( promise, expected ) {
		try {
			await promise;
		} catch ( err ) {
			expect( err ).to.equal( expected );

			return;
		}

		throw new Error( 'Expected the promise to be rejected.' );
	}
} );
