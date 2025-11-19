import { RecordListStyles } from "@/pages/sample/sample2/RecordList/RecordList.styles";
type RecordListlProps = {
  className?: string;
};
const RecordList: React.FC<RecordListlProps> = ({ className }) => {
  return <RecordListStyles className={className}></RecordListStyles>;
};

export default RecordList;
