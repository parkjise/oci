import styled from "styled-components";
import { DatePicker } from "antd";

export const DatePickerStyles = styled(DatePicker)`
  border-radius: 0.2rem;
  border: 1px solid #e5e8eb;
  .ant-picker-input > input::placeholder {
    font-size: 11px;
    color: #999;
  }
`;
