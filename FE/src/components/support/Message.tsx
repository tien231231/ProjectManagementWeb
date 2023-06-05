import { message } from "antd";
import { NoticeType } from "antd/es/message/interface";
import { useEffect, useRef } from "react";

export interface UseMessageApiReturnType {
  showMessage: (type: NoticeType, content: string, duration?: number) => void;
  contextHolder: React.ReactElement;
}

const useMessageApi = (): UseMessageApiReturnType => {
  const [messageApi, contextHolder] = message.useMessage();
  const messageRef = useRef(messageApi);

  useEffect(() => {
    messageRef.current = messageApi;
  }, [messageApi]);

  const showMessage = (
    type: NoticeType,
    content: string,
    duration?: number
  ) => {
    messageRef.current.open({
      key: 9999,
      type,
      content,
      duration,
    });
  };

  return { showMessage, contextHolder };
};

export default useMessageApi;
