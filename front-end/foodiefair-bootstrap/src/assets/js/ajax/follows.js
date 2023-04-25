
// 이 부분은 실제로 참조하는 사용자의 ID를 받아와야 합니다. != 로그인한 유저
const userId = 1;

// 초기 페이지 로드 시 팔로워와 팔로잉 데이터를 가져오고, 무한 스크롤을 적용합니다.
$(document).ready(function () {

    // 팔로워 수를 가져와서 화면에 표시
    fetchFollowCount(userId, 'followers')
        .then(function(count) {
            $('#follower-count').text(count);
            $('#followers-tab').text(`팔로워 ${count}명`);
        });

    // 팔로잉 수를 가져와서 화면에 표시
    fetchFollowCount(userId, 'followings')
        .then(function(count) {
            $('#following-count').text(count);
            $('#followings-tab').text(`팔로잉 ${count}명`);
        });

    // 팔로워 데이터를 가져와서 무한 스크롤 적용
    loadMoreFollowData('#followers-tab-pane .row-cols-1', userId, 'followers');

    // 팔로잉 데이터를 가져와서 무한 스크롤 적용
    loadMoreFollowData('#followings-tab-pane .row-cols-1', userId, 'followings');
});

// 스크롤 이벤트를 추가하여 사용자가 페이지 하단에 도달하면 추가 팔로워 데이터를 로드합니다.
$(window).on('scroll', function () {
    if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) { // 필요한 경우 100px 오프셋을 조정하세요
        if ($('#followers-tab').hasClass('active')) {
            loadMoreFollowData('#followers-tab-pane .row-cols-1', userId, 'followers');
        } else if ($('#followings-tab').hasClass('active')) {
            loadMoreFollowData('#followings-tab-pane .row-cols-1', userId, 'followings');
        }
    }
});

function fetchFollowData(userId, type, lastFollowId, perPage) {
    return $.ajax({
        url: `http://localhost:8081/mypage/${userId}/${type}`,
        method: 'GET',
        dataType: 'json',
        data: {
            lastFollowId: lastFollowId,
            perPage: perPage,
        },
    });
}

function fetchFollowCount(userId, type) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: `http://localhost:8081/mypage/${userId}/${type}/count`,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                let count = data;
                $(`#${type}-tab`).text(`${type === 'followers' ? '팔로워' : '팔로잉'} ${count}명`);
                resolve(count);
            },
            error: function (xhr, status, error) {
                reject(error);
            }
        });
    });
}

// 팔로워와 팔로잉 프로필 카드를 생성하는 함수
function createProfileCard(user) {
    return `
    <div class="col">
        <div class="card card-followers">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-4 col-12">
                        <div class="text-center position-relative">
                            <a href="shop-single.html" class="d-flex">
                                <div class="flex-grow-1">
                                    <img src="${user.userImg}" alt="Profile Image" class="mb-3 img-fluid d-inline" width="150" height="150">
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="col-md-8 col-12 flex-grow-1">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h2 class="fs-2"><a href="shop-single.html" class="text-inherit text-decoration-none">${user.userName}</a></h2>
                                <div>
                                    <small class="text-warning"> <i class="bi bi-star-fill"></i></small>
                                    <span class="text-muted small">임시 칭호</span>
                                </div>
                            </div>
                            <div class="mt-2">
                                <button class="btn btn-pink">팔로우</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function loadMoreFollowData(containerSelector, userId, type) {
    let lastItem = $(containerSelector).children().last();
    let lastFollowId = lastItem.length ? lastItem.data('follow-id') : 1;

    fetchFollowData(userId, type, lastFollowId, 10)
        .then(function (data) {
            console.log("Fetched data:", data);
            const html = data.map(createProfileCard).join('');
            $(containerSelector).append(html);

            if (data.length === 10) { // assuming you're fetching 10 items per page
                loadMoreFollowData(containerSelector, userId, type);
            }
        })
        .catch(function (error) {
            console.error(`Error fetching ${type} data:`, error);
        });
}

