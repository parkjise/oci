import React from "react";
import { Card, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { StyledDashboardContainer } from "./Dashboard.styles";

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <StyledDashboardContainer>
      <Card>
        <Title level={2}>{t("welcome_dashboard", "환영합니다!")}</Title>
        <Paragraph>
          {t(
            "dashboard_description",
            "이곳은 대시보드입니다. 주요 정보와 업데이트를 확인할 수 있습니다."
          )}
        </Paragraph>
      </Card>
    </StyledDashboardContainer>
  );
};

export default Dashboard;
