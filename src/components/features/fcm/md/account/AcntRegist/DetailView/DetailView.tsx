import React from "react";
import {
  FormLabel,
  FormInput
} from "@/components/ui/form";
import { DetailViewStyles } from "./DetailView.styles";
type DetailViewProps = {
  className?: string;
};
const DetailView: React.FC<DetailViewProps> = ({ className }) => {


  return (
    <DetailViewStyles className={className}>
      <div className="detail-view__table">
        <table>
          <tbody>
            <tr>
              <th>
                <FormLabel labelKey="계정코드" />
              </th>
              <td>
                <FormInput name="acntCd" />
              </td>
              <th>
                <FormLabel labelKey="계정과목명" />
              </th>
              <td>
                <FormInput name="acntNm" />
              </td>
            </tr>
            <tr>
              <th>
                <FormLabel labelKey="계정과목영문명" />
              </th>
              <td>
                <FormInput name="acntNm" />
              </td>
              <th>
                <FormLabel labelKey="계정코드약어" />
              </th>
              <td>
                <FormInput name="acntCdAbbr" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DetailViewStyles>
  );
};

export default DetailView;