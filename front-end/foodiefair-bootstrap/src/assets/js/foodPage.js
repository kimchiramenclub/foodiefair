function getSelectedFilters() {
    var stores = [];
    var categories = [];

    if ($("#CU").is(":checked")) {
        stores.push("CU");
    }
    if ($("#GS25").is(":checked")) {
        stores.push("GS25");
    }
    if ($("#Emart24").is(":checked")) {
        stores.push("이마트24");
    }
    if ($("#sevenEleven").is(":checked")) {
        stores.push("세븐일레븐");
    }

    if ($("#simple-01").is(":checked")) {
        categories.push("도시락");
    }
    if ($("#simple-02").is(":checked")) {
        categories.push("샌드위치/햄버거");
    }
    if ($("#simple-03").is(":checked")) {
        categories.push("샐러드");
    }
    if ($("#simple-04").is(":checked")) {
        categories.push("주먹밥/김밥");
    }
    if ($("#simple-05").is(":checked")) {
        categories.push("가공식품");
    }
    if ($("#simple-06").is(":checked")) {
        categories.push("안주류");
    }
    if ($("#instant-01").is(":checked")) {
        categories.push("튀김류");
    }
    if ($("#instant-02").is(":checked")) {
        categories.push("베이커리");
    }
    if ($("#instant-03").is(":checked")) {
        categories.push("즉석커피");
    }
    if ($("#cookie-01").is(":checked")) {
        categories.push("스낵/비스켓");
    }
    if ($("#cookie-02").is(":checked")) {
        categories.push("빵/디저트");
    }
    if ($("#cookie-03").is(":checked")) {
        categories.push("아이스크림");
    }
    if ($("#cookie-04").is(":checked")) {
        categories.push("껌/초콜릿/캔디");
    }
    if ($("#drink-01").is(":checked")) {
        categories.push("음료");
    }
    if ($("#drink-02").is(":checked")) {
        categories.push("아이스드링크");
    }
    if ($("#drink-03").is(":checked")) {
        categories.push("유제품");
    }

    return { stores: stores, categories: categories};
}

$("input[type='checkbox']").on("change", function () {
    loadProducts(1, $(".form-select").val());
});

$(".form-select").on("change", function() {
    loadProducts(1, $(this).val());
});

function loadProducts(page, sortOrder) {
    var filters = getSelectedFilters();

    var queryString = `?page=${page}&size=15`;

    if (filters.stores.length > 0) {
        queryString += `&stores=${encodeURIComponent(JSON.stringify(filters.stores))}`;
    }

    if (filters.categories.length > 0) {
        queryString += `&categories=${encodeURIComponent(JSON.stringify(filters.categories))}`;
    }

    if (sortOrder) {
        queryString += `&sortOrder=${sortOrder}`;
    }

    $.ajax({
        url: `http://localhost:8081/api/food-list${queryString}`,
        type: "GET",
        dataType: "json",
        success: function (response) {
            var data = response.dtoList;
            var total = response.total;
            var currentPage = response.page;
            $(".mb-3.mb-md-0 .text-dark").text(total);

            renderProducts(data);
            renderPagination(currentPage, total);
        },
        error: function (error) {
            console.log(error);
        },
    });
}

function renderProducts(data) {
    var $productContainer = $('#productContainer');
    $productContainer.empty();
    var productHtml = '';

    var filters = getSelectedFilters();
    var filteredProductCount = 0;

    $.each(data, function(index, product) {
        var festivalText, festivalColor;

        var storeMatched = filters.stores.some(function(store) {
            return JSON.parse(product.fixedTag).store.includes(store);
        });

        var categoryMatched = filters.categories.some(function(category) {
            return JSON.parse(product.fixedTag).smallCategory.includes(category);
        });

        if (!storeMatched || !categoryMatched) {
            return;
        }

        filteredProductCount++;

        if (product.productEvent === 1) {
            festivalText = '신상품';
            festivalColor = 'pink';
        } else if (product.productEvent === 2) {
            festivalText = '1+1';
            festivalColor = 'purple';
        } else if (product.productEvent === 3) {
            festivalText = '2+1';
            festivalColor = 'orange';
        } else {
            festivalText = '';
            festivalColor = '';
        }

        var fixedTag = JSON.parse(product.fixedTag).smallCategory;

        productHtml += `
            <div class="col">
              <div class="card card-product">
                <div class="card-body">
                  <div class="text-center position-relative">
                    <div class=" position-absolute top-0 start-0">
                      <span class="badge bg-${festivalColor}">${festivalText}</span>
                    </div>
                    <a href="shop-single.html">
                      <img class="mb-3 img-fluid" style="max-width: 220px; max-height: 220px;" src="${product.productImg}">
                    </a>
                  </div>
                  <div class="text-small mb-1"><a href="#" class="text-decoration-none text-muted">${fixedTag}</a></div>
                  <h2 class="fs-6"><a href="shop-single.html" class="text-inherit text-decoration-none">${product.productName}</a></h2>
                  <div>
                    <small class="text-warning"><i class="bi bi-star-fill"></i></small>
                    <span class="text-muted small">조회(<span>${product.productViews}</span>)</span>
                    <small class="text-warning"><i class="bi bi-star-fill"></i></small>
                    <span class="text-muted small">리뷰(<span>${product.productReviews}</span>)</span>
                    <small class="text-warning"><i class="bi bi-star-fill"></i></small>
                    <span class="text-muted small">찜(<span>${product.productSaved}</span>)</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mt-3">
                    <div></div>
                    <div>
                      <span class="text-dark">${product.productPrice}원</span>
                      <a href="#" class="ms-2 btn-action" style="color: deeppink"><i class="bi bi-bookmark"></i></a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
    });

    var productListHtml = `
      <div class="row g-4 row-cols-xl-5 row-cols-lg-3 row-cols-2 row-cols-md-2 mt-2">
        ${productHtml}
      </div>
    `;

    $productContainer.append(productListHtml);
}

function renderPagination(currentPage, totalItems) {
    var totalPages = Math.ceil(totalItems / 15);

    var pagination = $(".pagination");
    pagination.empty();

    // 이전 페이지 링크 추가
    var prevDisabled = currentPage === 1 ? "disabled" : "";
    pagination.append(`<li class="page-item ${prevDisabled}">
                          <a class="page-link mx-1" href="#" aria-label="Previous" data-page="${currentPage - 1}">
                            <i class="feather-icon icon-chevron-left"></i>
                          </a>
                        </li>`);

    // 페이지 번호 링크 추가
    for (var i = 1; i <= totalPages; i++) {
        var activeClass = i === currentPage ? "active" : "";
        var listItem = `<li class="page-item ${activeClass}">
                    <a class="page-link mx-1" href="#" data-page="${i}">${i}</a>
                  </li>`;
        pagination.append(listItem);
    }

    // 다음 페이지 링크 추가
    var nextDisabled = currentPage === totalPages ? "disabled" : "";
    pagination.append(`<li class="page-item ${nextDisabled}">
                          <a class="page-link mx-1" href="#" aria-label="Next" data-page="${currentPage + 1}">
                            <i class="feather-icon icon-chevron-right"></i>
                          </a>
                        </li>`);

    // 페이지 링크에 대한 클릭 이벤트 리스너 추가
    $(".pagination .page-link").on("click", function (event) {
        event.preventDefault();
        var pageNumber = parseInt($(this).data("page"));
        if (!isNaN(pageNumber)) {
            loadProducts(pageNumber);
        }
    });
}

$(document).ready(function () {
    loadProducts(1);
});