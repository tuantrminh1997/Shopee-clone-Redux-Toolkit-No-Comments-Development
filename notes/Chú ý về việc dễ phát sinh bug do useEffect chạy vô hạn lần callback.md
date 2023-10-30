# Nguyên nhân gây ra Bug useEffect chạy vô hạn lần callback khi đưa vào dependency queryConfig (kết quả trả về từ custome hook useQueryConfig())

- Nguyên nhân là do Component ProductList nhận giá trị queryConfig lần đầu mounted
  -> chạy callback 1 lần -> dispatch thunk action call API get product list -> component ProductList re-render do đã đăng ký sử dụng state productList trong productListSlice bằng useSelector.
  -> component ProductList được mounted tiếp.
  -> custome hook useQueryConfig() bị gọi tiếp và trả về 1 object queryConfig với tham chiếu mới mặc dù giá trị bên trong giống hệt tham chiếu cũ.
  -> dẫn đến sinh ra 2 object queryConfig ở 2 tham chiếu khác nhau, useEffect nhận diện được đây là 2 tham chiếu khác nhau.
  -> tiếp tục gọi callback và vòng lặp này cứ tiếp diễn liên tục.
  -> dẫn đến bug vòng lặp vô hạn.

# cách fix:

- custome Hook useQueryConfig thay đổi:

* cho return về giá trị lưu trong useState thay vì return thẳng về object queryConfig được khai báo mới bằng const queryConfig, vì như thế sẽ sinh ra 1 object mới với 1 tham chiếu mới hoàn toàn dù giá trị bên trong không khác gì giá trị với tham chiếu cũ -> gây ra bug useEffect bị gọi callback vô hạn lần.

- dependency queryParams được trả về từ custome hook useQueryParams cũng được handle bằng cách tương tự để tránh bug useEffect trong custome hook useQueryConfig được gọi lại vô hạn lần.
