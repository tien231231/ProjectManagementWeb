Nhánh đang làm việc : dev
QUẢN LÝ CÔNG VIỆC DỰ ÁN
1. Mô tả
Ứng dụng web quản lý công việc dự án được tạo ra nhằm giúp cho đội dự án phần mềm có thể dễ dàng và thuận tiên trong việc quản lý, phân công công việc và giao tiếp giữa các thành viên trong đội dự án.
Phạm vi sử dụng: trong 1 công ty công nghệ.
Đối tượng sử dụng: các CBNV của công ty công nghệ đó.
2. Yêu cầu chức năng
2.1.	Sơ đồ luồng công việc

 
2.2.	Vai trò của người dùng trong dự án
Trong mỗi dự án, người dùng có 1 vai trò duy nhất.
Có 4 vai trò trong 1 dự án:
-	Chủ dự án (Người tạo dự án), tối đa 1 người/dự án
-	Quản lý dự án, tối đa 3 người/dự án
-	Thành viên thường
-	Người giám sát dự án

2.3.	Sơ đồ chuyển đổi trạng công việc

  
-	Open: Đang chờ được thực hiện
-	In Progress: Đang thực hiện
-	In Review: Đang chờ xem xét
-	Done: Đã hoàn thành
-	Re-Open: Thực hiện lại
-	Cancel: Hủy bỏ

2.4.	Use cases
 
2.5.	Chi tiết
2.5.1.	Đăng ký tài khoản
-	Mô tả:
o	Người dùng đăng ký 1 tài khoản trên hệ thống và thực hiện xác nhận tài khoản qua email.
o	Người dùng nhập thông tin họ và tên, email, tên tài khoản, mật khẩu. 
o	Sau khi đăng ký, người dùng thực hiện cập nhật các thông tin cá nhân khác.
o	Người dùng có thể đăng ký tài khoản bằng Google Account.
-	Dữ liệu: 
o	Người dùng bao gồm các thông tin: họ và tên, giới tính, ngày sinh, mô tả bản thân, ảnh đại diện, email, số điện thoại, tên đăng nhập, mật khẩu.

2.5.2.	Quản lý dự án
-	Mô tả:
o	Người dùng xem danh sách dự án đang tham gia.
o	Người dùng có thể tạo mới 1 dự án.
o	Người dùng có thể cập nhật thông tin dự án nếu là chủ dự án hoặc quản lý dự án.
-	Dữ liệu:
o	Một dự án bao gồm các thông tin: mã dự án, tên dự án, ngày bắt đầu, ngày kết thúc dự kiến, mô tả dự án, trạng thái dự án.
o	Dự án có 4 trạng thái: 
	Chuẩn bị (chưa đến ngày bắt đầu dự án)
	Đang thực hiện
	Tạm đình chỉ (Dự án bị đình chỉ) 
	Hoàn thành (Với điều kiện không còn công việc nào có trạng thái khác Done hoặc Cancel)
-	Phân quyền:
o	Chủ dự án có thể cập nhật tất cả thông tin dự án.
o	Quản lý dự án có thể cập nhật trạng thái dự án.
2.5.3.	Quản lý thành viên của dự án
-	Mô tả:
o	Các thành viên có thể xem danh sách/chi tiết thành viên trong dự án.
o	Chủ dự án hoặc quản lý dự án có thể thêm, bớt, cập nhật vai trò thành viên trong dự án.
-	Dữ liệu:
o	Một dự án có nhiều thành viên.
o	Mỗi thành viên trong dự án là một người dùng trong hệ thống, bao gồm thông tin: họ và tên, email, vai trò, ngày vào dự án.

2.5.4.	Quản lý stages của dự án
-	Mô tả:
o	Các thành viên có thể xem danh sách/chi tiết stages của dự án.
o	Chủ dự án hoặc quản lý dự án có thể tạo mới/cập nhật stages cho dự án đang thực hiện.
o	Chủ dự án, quản lý dự án, người giám sát dự án có thể thực hiện đánh giá khi kết thúc stage.
-	Dữ liệu:
o	Một dự án bao gồm nhiều stages.
o	Mỗi stage bao gồm các thông tin: tên stage, ngày bắt đầu, ngày kết thúc dự kiến, ngày kết thúc thực tế.
o	Mỗi stage có nhiều bản đánh giá. Mỗi bản đánh giá bao gồm: nội dung đánh giá, người đánh giá.
-	Yêu cầu bổ sung:
o	Ngày bắt đầu của stage mới phải lớn hơn ngày kết thúc thực tế của stage gần nhất trước đó.
2.5.5.	Quản lý công việc của dự án
-	Mô tả:
o	Các thành viên có thể xem danh sách/chi tiết công việc của dự án ở tất cả các stages hoặc 1 stage được chọn.
o	Các thành viên có thể tạo mới/cập nhật công việc cho stage hiện tại.
-	Dữ liệu:
o	Một stages có nhiều công việc. Một công việc thuộc về 1 stage.
o	Mỗi công việc bao gồm các thông tin: mã công việc, tiêu đề, loại công việc, độ ưu tiên, ngày tạo, ngày bắt đầu, hạn chót, ngày kết thúc thực tế, mô tả công việc, trạng thái, người tạo, người thực hiện.
o	2 loại công việc: “Nhiệm vụ”, “Vấn đề”.
o	5 độ ưu tiên: “Cao nhất”, “Cao”, “Trung bình”, “Thấp”, “Thấp nhất”. 
-	Yêu cầu bổ sung:
o	Hiển thị danh sách công việc dưới dạng Agile Board bao gồm 6 cột trạng thái và các công việc tương ứng của 6 cột.
o	Cột trạng thái “Cancel” có thể ẩn/hiện tùy ý.
o	Khi 1 stage được tạo mới, toàn bộ các công việc với trạng thái khác Done, Cancel ở stage đã kết thúc trước đó tự động di chuyển sang stage mới.
-	Phân quyền:
o	Chủ dự án, quản lý dự án, người tạo công việc có thể sửa tất cả thông tin của công việc đã tạo.
o	Người thực hiện công việc chỉ được phép cập nhật trạng thái công việc.
2.5.6.	Trao đổi công việc
-	Mô tả:
o	Các thành viên có thể thực hiện trao đổi công việc bằng cách tạo các comment tại công việc muốn trao đổi.
-	Dữ liêu:
o	Một công việc có nhiều comments. Một comment thuộc về 1 công việc.
o	Mỗi comment bao gồm thông tin: nội dung, người tạo, ngày tạo.
-	Yêu cầu bổ sung
o	Các thành viên có thể thực hiện tag 1 hoặc nhiều thành viên khác vào một comment.

3. Yêu cầu khác
-	Công nghệ (chọn 1 FE, 1 BE):
o	FE:  
	ReactJS
	Vue
	Angular
o	BE: 
	NodeJS + ExpressJS + MongoDB
	PHP + MySQL
	C# + SQL Server
	Python + (PostgreSQL | MongoDB)
-	Công cụ:
o	Text editor, IDE: VS Code, Visual Studio, PHP Storm, …
o	UI/UX Design: Figma, …
o	Source Control: GIT + (Github | Gitlab)
o	Mail: mailtrap.io
-	Không giới hạn công nghệ làm cho các tính năng riêng.

