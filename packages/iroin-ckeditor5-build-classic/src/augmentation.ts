/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { default as IroinUploadAdapter, IroinUploadConfig } from './iroinuploadadapter.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * Konfiguration des {@link IroinUploadAdapter}.
		 */
		iroinUpload?: IroinUploadConfig;
	}

	interface PluginsMap {
		[ IroinUploadAdapter.pluginName ]: IroinUploadAdapter;
	}
}
