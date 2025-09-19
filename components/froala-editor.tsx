'use client';

import FroalaEditor from 'react-froala-wysiwyg';
import FroalaEditorView from 'react-froala-wysiwyg/FroalaEditorView';
import {FC, memo, useEffect, useMemo, useRef, useState} from 'react';
import {Control, Controller} from 'react-hook-form';
import 'froala-editor/js/plugins.pkgd.min.js';
import 'froala-editor/js/plugins/image.min.js';
import 'froala-editor/css/plugins/image.min.css';
import '@/styles/froala_editor.pkgd.min.css';
import '@/styles/froala_editor.css';

interface Props {
    name: string;
    control: Control<any>;
    minHeight?: number;
    charCounterMax?: number;
    isOptional?: boolean | string;
    placeholder?: string;
    errorMessage?: string;
    description?: string;
    isActive: boolean;
    isDisable?: boolean;
    onChange?: (e: string) => void;
}

const FormEditor: FC<Props> = ({name, control, minHeight, isOptional, isActive, isDisable, placeholder, errorMessage, description, onChange}) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <Controller
            control={control}
            name={name}
            render={({field, fieldState}) => {
                return (
                    <div className='flex flex-col gap-y-2'>
                        <div
                            ref={ref}
                            className={`flex flex-col gap-y-2 transition duration-200 ease-in-out ${
                                isDisable
                                    ? 'py-3'
                                    : fieldState.error
                                      ? 'border-b border-red-500 bg-transparent px-2 py-3 hover:bg-transparent'
                                      : isActive
                                        ? 'border-b-2 border-default-300 bg-transparent px-2 py-3 hover:bg-transparent'
                                        : 'pb-3'
                            } `}
                        >
                            <FroalaEditor
                                config={{
                                    tag: 'textarea',
                                    imageEditButtons: [
                                        'imageReplace',
                                        'imageAlign',
                                        'imageRemove',
                                        '|',
                                        'imageLink',
                                        'linkOpen',
                                        'linkEdit',
                                        'linkRemove',
                                        '-',
                                        'imageDisplay',
                                        'imageAlt',
                                        'imageSize',
                                    ],
                                    toolbarButtons: {
                                        // Key represents the more button from the toolbar.
                                        moreText: {
                                            // List of buttons used in the  group.
                                            buttons: ['bold', 'italic', 'underline', 'clearFormatting'],

                                            // Alignment of the group in the toolbar.
                                            align: 'left',

                                            // By default, 3 buttons are shown in the main toolbar. The rest of them are available when using the more button.
                                            buttonsVisible: 4,
                                        },

                                        moreRich: {
                                            buttons: ['insertImage'],
                                            align: 'left',
                                            buttonsVisible: 1,
                                        },
                                    },
                                    videoUpload: false,
                                    fileUpload: false,
                                    imagePaste: false,
                                    toolbarInline: true,
                                    toolbarSticky: false,
                                    quickInsertEnabled: true,
                                    charCounterCount: false,
                                    primaryColor: '#006c4a',
                                    heightMin: minHeight ?? 150,
                                    imageAllowedTypes: ['jpeg', 'jpg', 'png'],
                                    imageUploadParam: 'files',
                                    pastePlain: true,
                                    quickInsertButtons: ['embedly', 'table', 'ul', 'ol', 'hr'],
                                    imageUploadURL: '/api/upload',
                                    key: 'AV:4~?3xROKLJKYHROLDXDR@d2YYGR_Bc1A8@5@4:1B2D2F2F1?1?2A3@1C1',
                                    placeholderText: placeholder ?? '',
                                    tooltips: false,
                                    fontFamilyDefaultSelection: 'Inter',
                                    fontSizeDefaultSelection: 12,
                                    events: {
                                        focus: function () {
                                            ref.current?.classList.add('border-b-2', 'border-primary');
                                        },
                                        blur: function () {
                                            ref.current?.classList.remove('border-b-2', 'border-primary');
                                            ref.current?.classList.add('border-b-2', 'border-default-300');
                                        },
                                        initialized() {
                                            const editor = this as any;

                                            if (isDisable) {
                                                editor.edit?.off();
                                                editor.edit?.isDisabled();
                                            } else {
                                                editor.edit?.on();
                                                // editor.edit.isEnabled();
                                            }
                                        },
                                    },
                                }}
                                model={field.value}
                                onModelChange={(value: string) => {
                                    field.onChange(value);
                                }}
                            />
                        </div>
                        <p className='text-xs text-default-400'>{description}</p>
                    </div>
                );
            }}
            rules={{
                validate: (value) => {
                    return isOptional ? true : value.replace(/<[^>]*>/g, '') !== '' ? true : 'This field is required';
                },
                onChange: (e) => {
                    if (e.type === 'change' && onChange) onChange(e.target.value);
                },
            }}
        />
    );
};

const FroalaEditorForm: FC<{
    label?: string;
    placeholder?: string;
    value?: string;
    isRequired?: boolean;
    isInvalid?: boolean;
    errorMessage?: string;
    onChange?: (value: string) => void;
}> = ({label, placeholder, value, isRequired, isInvalid, errorMessage, onChange}) => {
    const [ref, setRef] = useState<HTMLDivElement>();

    const config = useMemo(() => {
        return {
            tag: 'textarea',
            editorClass: isInvalid ? 'danger' : '',
            toolbarButtons: {
                // Key represents the more button from the toolbar.
                moreText: {
                    // List of buttons used in the  group.
                    buttons: [
                        'bold',
                        'italic',
                        'underline',
                        'strikeThrough',
                        'subscript',
                        'superscript',
                        'inlineClass',
                        'inlineStyle',
                        'clearFormatting',
                    ],

                    // Alignment of the group in the toolbar.
                    align: 'left',

                    // By default, 3 buttons are shown in the main toolbar. The rest of them are available when using the more button.
                    buttonsVisible: 3,
                },

                moreParagraph: {
                    buttons: ['alignLeft', 'alignCenter', 'formatULSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL'],
                    align: 'left',
                    buttonsVisible: 3,
                },
            },
            videoUpload: false,
            fileUpload: false,
            imageUpload: false,
            imagePaste: false,
            toolbarSticky: false,
            charCounterCount: false,
            quickInsertEnabled: false,
            primaryColor: '#006c4a',
            heightMin: 150,
            imageAllowedTypes: ['jpeg', 'jpg', 'png'],
            imageUploadParam: 'files',
            pastePlain: true,
            quickInsertButtons: ['embedly', 'table', 'ul', 'ol', 'hr'],
            imageUploadURL: '/api/upload',
            key: 'AV:4~?3xROKLJKYHROLDXDR@d2YYGR_Bc1A8@5@4:1B2D2F2F1?1?2A3@1C1',
            placeholderText: placeholder,
            tooltips: false,
            fontFamilyDefaultSelection: 'Inter',
            fontSizeDefaultSelection: 12,
            events: {
                initialized() {
                    const editor = this as any;

                    setRef(editor.$box[0] as HTMLDivElement);
                },
            },
        };
    }, [isInvalid, placeholder]);

    useEffect(() => {
        if (isInvalid) ref?.classList.add('danger');
        else ref?.classList.remove('danger');
    }, [ref, isInvalid]);

    return (
        <div className='relative flex w-full flex-col'>
            <label
                className={`pointer-events-none absolute z-10 block max-w-full origin-top-left cursor-text overflow-hidden text-ellipsis px-4 pe-2 pt-2 text-xs subpixel-antialiased transition-[transform,color,left,opacity] !duration-200 !ease-out will-change-auto after:ml-0.5 after:text-danger group-data-[filled-within=true]:pointer-events-auto group-data-[filled-within=true]:-translate-y-[calc(50%_+_theme(fontSize.small)/2_-_6px)] group-data-[filled-within=true]:scale-85 group-data-[filled-within=true]:text-default-600 motion-reduce:transition-none rtl:origin-top-right rtl:after:ml-[unset] rtl:after:mr-0.5 ${
                    isInvalid ? 'text-danger' : 'text-foreground-600'
                } ${isRequired ? "after:content-['*']" : ''}`}
                data-slot='label'
            >
                {label}
            </label>
            <FroalaEditor
                config={config}
                model={value}
                onModelChange={onChange}
            />
            {isInvalid ? (
                <div
                    className='py-1 text-tiny text-danger'
                    data-slot='error-message'
                    id='react-aria1098781840-:r222:'
                >
                    {errorMessage ?? 'This field is required'}
                </div>
            ) : null}
        </div>
    );
};

const FormView: FC<{model: string}> = ({model}) => <FroalaEditorView model={model} />;

export const Editor = memo(FroalaEditorForm);

export const View = memo(FormView);

export default memo(FormEditor);
