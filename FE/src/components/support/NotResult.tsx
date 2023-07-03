import { Button, Result } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
interface IProps {
  title: string;
}
const NotResult: React.FC<IProps> = ({ title }) => {
  const { t } = useTranslation(["base"]);

  return (
    <Result
      status="404"
      title="404"
      subTitle={title + " " + t("base:notFound")}
      extra={
        <Link to="/">
          <Button type="primary">{t("base:backHome")}</Button>
        </Link>
      }
    />
  );
};

export default NotResult;
