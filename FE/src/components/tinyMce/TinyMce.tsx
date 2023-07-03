import imageApi from "../../services/api/imageApi";
import { Editor } from "@tinymce/tinymce-react";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Editor as TinyMCEEditor } from "tinymce";

type Props = {
  setContentMce: Dispatch<SetStateAction<string>>;
  description: string;
  defaultValue?: string;
};

const TinyMce = ({ setContentMce, description, defaultValue }: Props) => {
  const tinyRef = useRef<TinyMCEEditor | null>(null);
  function handleEditorChange(content: any, editor: any) {
    setContentMce(content);
  }

  return (
    <div
      style={{ height: description ? "700px" : "300px" }}
      className="tinymce__main"
    >
      <Editor
        onInit={(evt, editor) => {
          tinyRef.current = editor;
        }}
        initialValue={defaultValue && defaultValue}
        apiKey={process.env.REACT_APP_TINYMCE_KEY}
        init={{
          height: "100%",
          width: "100%",
          menubar: false,
          statusbar: false,
          plugins: ["image", "charmap", "preview", "emoticons"],
          toolbar: `
                   undo redo | formatselect  preview bold italic   image  backcolor  
                    alignleft aligncenter alignright alignjustify  
                    bullist numlist outdent indent | removeformat charmap emoticons 
                        `,
          file_picker_types: "file image media",
          image_class_list: [{ title: "Responsive", value: "img-tiny" }],
          images_upload_handler: async (blobInfo) => {
            return new Promise((resolve, reject) => {
              let imageFile = new FormData();
              imageFile.append("image", blobInfo.blob());
              imageApi
                .uploadImg(imageFile)
                .then((data: any) => {
                  const url = data.image;
                  resolve(url);
                })
                .catch((e) => {
                  reject(e);
                });
            });
          },
        }}
        value={description}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
};

export default TinyMce;
