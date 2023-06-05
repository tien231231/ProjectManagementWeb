import { decode, encode } from "js-base64";
// o	Một dự án bao gồm nhiều stages.
// o	Mỗi stage bao gồm các thông tin: tên stage, ngày bắt đầu, ngày kết thúc dự kiến, ngày kết thúc thực tế.
// o	Mỗi stage có nhiều bản đánh giá. Mỗi bản đánh giá bao gồm: nội dung đánh giá, người đánh giá.

const description = encode(
  `<figure class="image"><img src="https://vcdn-thethao.vnecdn.net/2022/12/10/messi-3-jpeg-1670629980-167062-7567-4192-1670631569.jpg" alt="Lập trình viên đang code"></figure><h2>Công việc lập trình</h2><ul><li>&nbsp;Ngôn ngữ lập trình</li><li>Công cụ phát triển phần mềm</li><li>Thiết kế giao diện</li><li>Quản lý cơ sở dữ liệu</li><li>Bảo mật thông tin</li></ul><p>Lập trình là một công việc rất thú vị và có tính thử thách cao. Nó đòi hỏi sự kiên trì, tư duy logic, khả năng phân tích và giải quyết vấn đề.</p><p>Một lập trình viên tốt cần phải biết các kỹ năng liên quan đến lập trình để có thể làm việc hiệu quả và giải quyết các vấn đề phát sinh.</p><p>Nếu bạn muốn trở thành một lập trình viên giỏi, hãy bắt đầu học ngay từ bây giờ!</p><p>&nbsp;</p><p>&nbsp;</p><figure class="table"><table><tbody><tr><td>Bắt đầu học ngôn ngữ lập trình cơ bản</td><td><p>&nbsp;</p><ol><li>Thực hành viết code</li></ol></td><td>Tìm hiểu về các công cụ phát triển phần mềm</td><td>Hiểu về quản lý cơ sở dữ liệu</td></tr><tr><td>Học thiết kế giao diện</td><td>Hiểu về quản lý cơ sở dữ liệu</td><td>Hiểu về quản lý cơ sở dữ liệu</td><td>Hiểu về quản lý cơ sở dữ liệu</td></tr><tr><td>Hiểu về quản lý cơ sở dữ liệu</td><td>Hiểu về quản lý cơ sở dữ liệu</td><td>&nbsp;</td><td>Hiểu về quản lý cơ sở dữ liệu</td></tr></tbody></table></figure><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>Tìm hiểu về bảo mật thông tin <a href="sieuquayks.wap.sh">sieuquayks.wap.sh</a></p><p>&nbsp;</p><blockquote><h2>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Nếu một mai trên đường đời<i> vấp ngã</i></h2></blockquote>`
);
export const descriptionTest = decode(description);

export const listStages = [
  {
    _id: "1",

    name: "stages-1",
    startDate: "2023-03-01T00:00:00.000Z",
    estimatedEndDate: "2024-12-31T00:00:00.000Z",

    status: "open",
    actualEndDate: "2023-04-16T12:36:46.352Z",
    createdDate: "2023-04-16T12:36:46.352Z",
  },
  {
    _id: "2",

    name: "stages-2",
    startDate: "2023-03-01T00:00:00.000Z",
    estimatedEndDate: "2024-12-31T00:00:00.000Z",

    status: "open",
    actualEndDate: "2023-04-16T12:36:46.352Z",
    createdDate: "2023-04-16T12:36:46.352Z",
  },
  {
    _id: "3",

    name: "stages-3",
    startDate: "2023-03-01T00:00:00.000Z",
    estimatedEndDate: "2024-12-31T00:00:00.000Z",

    status: "open",
    actualEndDate: "2023-04-16T12:36:46.352Z",
    createdDate: "2023-04-16T12:36:46.352Z",
  },
  {
    _id: "4",

    name: "stages-4",
    startDate: "2023-03-01T00:00:00.000Z",
    estimatedEndDate: "2024-12-31T00:00:00.000Z",

    status: "open",
    actualEndDate: "2023-04-16T12:36:46.352Z",
    createdDate: "2023-04-16T12:36:46.352Z",
  },
  {
    _id: "5",

    name: "stages-5",
    startDate: "2023-03-01T00:00:00.000Z",
    estimatedEndDate: "2024-12-31T00:00:00.000Z",

    status: "open",
    actualEndDate: "2023-04-16T12:36:46.352Z",
    createdDate: "2023-04-16T12:36:46.352Z",
  },
  {
    _id: "6",

    name: "stages-6",
    startDate: "2023-03-01T00:00:00.000Z",
    estimatedEndDate: "2024-12-31T00:00:00.000Z",

    status: "open",
    actualEndDate: "2023-04-16T12:36:46.352Z",
    createdDate: "2023-04-16T12:36:46.352Z",
  },
  {
    _id: "7",

    name: "stages-7",
    startDate: "2023-03-01T00:00:00.000Z",
    estimatedEndDate: "2024-12-31T00:00:00.000Z",

    status: "open",
    actualEndDate: "2023-04-16T12:36:46.352Z",
    createdDate: "2023-04-16T12:36:46.352Z",
  },
  {
    _id: "8",

    name: "stages-8",
    startDate: "2023-03-01T00:00:00.000Z",
    estimatedEndDate: "2024-12-31T00:00:00.000Z",

    status: "open",
    actualEndDate: "2023-04-16T12:36:46.352Z",
    createdDate: "2023-04-16T12:36:46.352Z",
  },
  {
    _id: "9",

    name: "stages-9",
    startDate: "2023-03-01T00:00:00.000Z",
    estimatedEndDate: "2024-12-31T00:00:00.000Z",

    status: "open",
    actualEndDate: "2023-04-16T12:36:46.352Z",
    createdDate: "2023-04-16T12:36:46.352Z",
  },
  {
    _id: "10",

    name: "stages-10",
    startDate: "2023-03-01T00:00:00.000Z",
    estimatedEndDate: "2024-12-31T00:00:00.000Z",

    status: "open",
    actualEndDate: "2023-04-16T12:36:46.352Z",
    createdDate: "2023-04-16T12:36:46.352Z",
  },
  {
    _id: "11",

    name: "stages-11",
    startDate: "2023-03-01T00:00:00.000Z",
    estimatedEndDate: "2024-12-31T00:00:00.000Z",

    status: "open",
    actualEndDate: "2023-04-16T12:36:46.352Z",
    createdDate: "2023-04-16T12:36:46.352Z",
  },
];
