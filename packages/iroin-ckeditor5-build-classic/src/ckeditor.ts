/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { CKFinderUploadAdapter } from '@ckeditor/ckeditor5-adapter-ckfinder';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CKBox } from '@ckeditor/ckeditor5-ckbox';
import { CKFinder } from '@ckeditor/ckeditor5-ckfinder';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Heading } from '@ckeditor/ckeditor5-heading';
import {
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageInsert,
	ImageUpload,
	PictureEditing,
	ImageResizeEditing,
	ImageResizeHandles
} from '@ckeditor/ckeditor5-image';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { Font } from '@ckeditor/ckeditor5-font';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import type { Editor } from '@ckeditor/ckeditor5-core';
import coreTranslations from 'ckeditor5/dist/translations/fr.js';

export default class IroinClassicEditor extends ClassicEditorBase {
	public static override builtinPlugins = [
		Essentials,
		CKFinderUploadAdapter,
		Autoformat,
		Alignment,
		Bold,
		Italic,
		BlockQuote,
		CKBox,
		CKFinder,
		CloudServices,
		Font,
		GeneralHtmlSupport,
		EasyImage,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		ImageInsert,
		ImageUpload,
		ImageResizeEditing,
		ImageResizeHandles,
		Indent,
		Link,
		LinkImage,
		List,
		MediaEmbed,
		Mention,
		MentionCustomization,
		Paragraph,
		PasteFromOffice,
		PictureEditing,
		SourceEditing,
		Table,
		TableToolbar,
		TextTransformation,
		Underline
	];

	public static override defaultConfig = {
		toolbar: {
			items: [
				'heading',
				'|',
				'fontSize',
				'fontFamily',
				'fontColor',
				'|',
				'bold',
				'italic',
				'alignment',
				'link',
				'bulletedList',
				'numberedList',
				'|',
				'indent',
				'outdent',
				'|',
				'imageUpload',
				'insertImage',
				'blockQuote',
				'insertTable',
				'mediaEmbed',
				'|',
				'sourceEditing',
				'undo',
				'redo'
			]
		},
		fontFamily: {
			options: [
				'default',
				'Arial, Helvetica, sans-serif',
				'Courier New, Courier, monospace',
				'Georgia, serif',
				'Lucida Sans Unicode, Lucida Grande, sans-serif',
				'Tahoma, Geneva, sans-serif',
				'Times New Roman, Times, serif',
				'Trebuchet MS, Helvetica, sans-serif',
				'Verdana, Geneva, sans-serif'
			],
			supportAllValues: true
		},
		fontSize: {
			options: [ '10px', '12px', '14px', '16px', '18px' ]
		},
		fontColor: {
			columns: 6,
			documentColors: 30,
			colors: [
				{ color: 'hsl(202, 100%, 67%)', label: ' ' },
				{ color: 'hsl(172, 97%, 72%)', label: ' ' },
				{ color: 'hsl(100, 95%, 64%)', label: ' ' },
				{ color: 'hsl(55, 100%, 67%)', label: ' ' },
				{ color: 'hsl(5, 100%, 78%)', label: ' ' },
				{ color: 'hsl(330, 100%, 79%)', label: ' ' },
				{ color: 'hsl(202, 100%, 50%)', label: ' ' },
				{ color: 'hsl(173, 82%, 50%)', label: ' ' },
				{ color: 'hsl(104, 68%, 53%)', label: ' ' },
				{ color: 'hsl(49, 100%, 60%)', label: ' ' },
				{ color: 'hsl(7, 100%, 65%)', label: ' ' },
				{ color: 'hsl(330, 100%, 63%)', label: ' ' },
				{ color: 'hsl(202, 100%, 36%)', label: ' ' },
				{ color: 'hsl(170, 100%, 34%)', label: ' ' },
				{ color: 'hsl(110, 100%, 35%)', label: ' ' },
				{ color: 'hsl(41, 100%, 50%)', label: ' ' },
				{ color: 'hsl(6, 90%, 49%)', label: ' ' },
				{ color: 'hsl(330, 80%, 46%)', label: ' ' },
				{ color: 'hsl(204, 100%, 25%)', label: ' ' },
				{ color: 'hsl(176, 100%, 21%)', label: ' ' },
				{ color: 'hsl(119, 100%, 22%)', label: ' ' },
				{ color: 'hsl(28, 100%, 47%)', label: ' ' },
				{ color: 'hsl(8, 100%, 35%)', label: ' ' },
				{ color: 'hsl(330, 83%, 32%)', label: ' ' },
				{ color: 'hsl(0, 0%, 85%)', label: ' ' },
				{ color: 'hsl(0, 0%, 70%)', label: ' ' },
				{ color: 'hsl(0, 0%, 55%)', label: ' ' },
				{ color: 'hsl(0, 0%, 40%)', label: ' ' },
				{ color: 'hsl(0, 0%, 25%)', label: ' ' },
				{ color: 'hsl(0, 0%, 0%)', label: ' ' }
			]
		},
		image: {
			// Configure the available styles.
			styles: {
				options:
				[
					'alignLeft', 'alignCenter', 'alignRight'
				]
			},
			// Configure the available image resize options.
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original',
					value: null
				},
				{
					name: 'resizeImage:custom',
					label: 'Custom',
					value: 'custom'
				},
				{
					name: 'resizeImage:50',
					label: '50%',
					value: '50'
				},
				{
					name: 'resizeImage:75',
					label: '75%',
					value: '75'
				}
			],
			toolbar: [
				'imageStyle:alignLeft',
				'imageStyle:alignCenter',
				'imageStyle:alignRight',
				'|',
				'imageResize',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		// This value must be kept in sync with the language defined in webpack.config.js.
		language: 'de',
		translations: [
			coreTranslations
		]
	};
}

function MentionCustomization( editor: Editor ): void {
	// Der Upcast-Converter wird <span class="mention" href="" data-user-id="">-Elemente
	// in das Model-Textattribut 'mention' konvertieren.
	editor.conversion.for( 'upcast' ).elementToAttribute( {
		view: {
			name: 'span',
			key: 'data-mention',
			classes: 'mention',
			attributes: {
				'data-user-id': true
			}
		},
		model: {
			key: 'mention',
			value: ( viewItem: any ) => {
				// Die Mention-Funktion erwartet, dass der Wert des Mention-Attributs im Model
				// ein einfaches Objekt mit einer Reihe zusätzlicher Attribute ist.
				// Um ein richtiges Objekt zu erstellen, verwenden Sie die toMentionAttribute()-Hilfsmethode:
				const mentionAttribute = editor.plugins.get( 'Mention' ).toMentionAttribute( viewItem, {
					// Füge weitere benötigte Eigenschaften hinzu.
					userId: viewItem.getAttribute( 'data-user-id' )
				} );

				return mentionAttribute;
			}
		},
		converterPriority: 'high'
	} );

	// Konvertiere das Model-Textattribut 'mention' in ein View-<span>-Element.
	editor.conversion.for( 'downcast' ).attributeToElement( {
		model: 'mention',
		view: ( modelAttributeValue: any, { writer }: { writer: any } ) => {
			// Konvertiere keine leeren Attribute (fehlender Wert bedeutet kein Mention).
			if ( !modelAttributeValue ) {
				return;
			}

			return writer.createAttributeElement( 'span', {
				class: 'mention',
				'data-mention': modelAttributeValue.id,
				'data-user-id': modelAttributeValue.userId
			}, {
				// Erwähnungsattribut soll von anderen Attributelementen umschlossen werden.
				priority: 20,
				// Verhindere das Zusammenführen von Mentions.
				id: modelAttributeValue.uid
			} );
		},
		converterPriority: 'high'
	} );
}
