// ==UserScript==
// @name         Silisili弹幕下载工具
// @namespace    https://github.com/zhaohuaxs
// @version      1.2.0
// @description  为Silisili网站添加弹幕下载功能，支持选择性下载、修复复选框布局问题、增强元素检测
// @author       LingCi
// @copyright    2025, LingCi(https://github.com/zhaohuaxs)
// @match        https://www.silisilifun.com/*
// @match        https://www.silisili.link/*
// @match        https://www.sssfun.cc/*
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @connect      silisilifun.com
// @connect      silisili.link
// @connect      sssfun.cc
// @icon https://zhaohuaxs.github.io/icon/favicon.ico
// @downloadURL https://zhaohuaxs.github.io/scripts/silisili_danmu_download.user.js
// @updateURL https://zhaohuaxs.github.io/scripts/silisili_danmu_download.user.js
// ==/UserScript==

(function () {
    'use strict';

    // 初始化状态标志
    let isInitialized = false;

    // 页面加载完成后执行
    function initializeScript() {
        // 检查是否已经初始化过
        if (isInitialized) {
            return;
        }
        
        // 查找目标元素
        const scoreWrap = document.querySelector('h1.scores-info > div.score-wrap');
        const titleElement = document.querySelector('h1.scores-info > a');
        const playListContainer = document.querySelector('div.play-list > div.play-pannel-box > div:nth-child(1) > #playlist-play-4');

        // 检查元素是否存在
        if (scoreWrap && titleElement && playListContainer) {
            // 设置初始化标志
            isInitialized = true;
            // 创建下载按钮
            const downloadBtn = document.createElement('div');
            downloadBtn.id = 'dm-down';
            downloadBtn.style.marginLeft = '20px';
            downloadBtn.style.color = '#ff5c7c';
            downloadBtn.textContent = '下载弹幕';
            downloadBtn.style.cursor = 'pointer';
            downloadBtn.style.display = 'inline-block';

            // 创建全选按钮
            const selectAllBtn = document.createElement('div');
            selectAllBtn.id = 'select-all';
            selectAllBtn.style.marginLeft = '20px';
            selectAllBtn.style.color = '#4CAF50';
            selectAllBtn.textContent = '全选';
            selectAllBtn.style.cursor = 'pointer';
            selectAllBtn.style.display = 'inline-block';

            // 创建反选按钮
            const invertSelectBtn = document.createElement('div');
            invertSelectBtn.id = 'invert-select';
            invertSelectBtn.style.marginLeft = '20px';
            invertSelectBtn.style.color = '#2196F3';
            invertSelectBtn.textContent = '反选';
            invertSelectBtn.style.cursor = 'pointer';
            invertSelectBtn.style.display = 'inline-block';

            // 添加到页面
            scoreWrap.appendChild(downloadBtn);
            scoreWrap.appendChild(selectAllBtn);
            scoreWrap.appendChild(invertSelectBtn);

            // 获取所有剧集的链接元素
            const episodeElements = document.querySelectorAll('div.play-list > div.play-pannel-box > div:nth-child(1) > #playlist-play-4 > li > a');

            // 为每个剧集链接添加复选框
            episodeElements.forEach((element, index) => {
                // 创建复选框容器
                const checkboxContainer = document.createElement('div');
                checkboxContainer.style.display = 'flex';
                checkboxContainer.style.alignItems = 'center';
                checkboxContainer.style.marginRight = '5px';
                checkboxContainer.style.marginBottom = '5px';
                checkboxContainer.style.zIndex = '9999';
                checkboxContainer.style.position = 'relative';
                
                // 创建复选框
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `episode-checkbox-${index}`;
                checkbox.checked = false; // 默认不选中
                
                // 将复选框添加到容器中
                checkboxContainer.appendChild(checkbox);
                
                // 将复选框容器插入到li元素的开头
                const liElement = element.parentElement;
                liElement.insertBefore(checkboxContainer, liElement.firstChild);
                
                // 阻止复选框容器的点击事件冒泡到li元素
                checkboxContainer.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            });

            // 全选按钮点击事件
            selectAllBtn.addEventListener('click', function() {
                const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="episode-checkbox-"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                });
            });

            // 反选按钮点击事件
            invertSelectBtn.addEventListener('click', function() {
                const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="episode-checkbox-"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = !checkbox.checked;
                });
            });

            // 下载按钮点击事件
            downloadBtn.addEventListener('click', function() {
                // 获取标题文本作为名称
                const name = titleElement.textContent.trim();
                
                // 获取所有剧集的链接元素
                const episodeElements = document.querySelectorAll('div.play-list > div.play-pannel-box > div:nth-child(1) > #playlist-play-4 > li > a');
                const dataIndexList = [];
                
                episodeElements.forEach((element, index) => {
                    // 检查对应的复选框是否被选中
                    const checkbox = document.querySelector(`#episode-checkbox-${index}`);
                    if (checkbox && checkbox.checked) {
                        // 从URL中提取数据索引，例如从 /vodplay/DH57777Z/4/1/ 中提取最后一位数字 "1"
                        const urlPath = element.pathname;
                        const pathParts = urlPath.split('/');
                        // 获取路径的最后一部分（数字）
                        const lastIndex = pathParts[pathParts.length - 2]; // 倒数第二个是数字，最后一个为空字符串
                        if (lastIndex && !isNaN(lastIndex)) {
                            dataIndexList.push(lastIndex);
                        }
                    }
                });

                // 如果没有选择任何集数，给出提示
                if (dataIndexList.length === 0) {
                    alert('请至少选择一集进行下载！');
                    return;
                }

                // 循环下载每个弹幕文件
                downloadDanmuFiles(name, dataIndexList);
            });
            
            // 移除监听器，避免重复执行
            observer.disconnect();
        }
    }

    // 在页面加载完成后尝试初始化
    window.addEventListener('load', initializeScript);

    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver(initializeScript);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 页面已经加载完成的情况下立即尝试初始化
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeScript();
    }

    // 下载弹幕文件函数
    function downloadDanmuFiles(name, dataIndexList) {
        // 计数器，用于跟踪已完成的请求数
        let completedRequests = 0;

        // 对每个data-index发送请求并单独下载文件
        dataIndexList.forEach((dataIndex, index) => {
            const url = `https://www.silisilifun.com/static/player/AB/api.php?act=dm&m=get&id=${name}${dataIndex}`;

            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                onload: function (response) {
                    // 过滤掉包含'admin,0'的<d>标签
                    let filteredContent = response.responseText;
                    // 使用正则表达式匹配并删除包含'admin,0'的<d>标签
                    filteredContent = filteredContent.replace(/'/g, '"');
                    filteredContent = filteredContent.replace(/<d[^>]*p="[^"]*admin,0[^"]*"[^>]*>.*?<\/d>/g, '');

                    // 为每个文件添加XML头部声明
                    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
                    const contentWithHeader = xmlHeader + filteredContent;

                    // 创建Blob对象
                    const blob = new Blob([contentWithHeader], {type: 'text/xml;charset=utf-8'});

                    // 创建下载链接
                    const downloadUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    // 按要求格式化文件名：${name}${data-index}.xml
                    a.download = `${name}-${dataIndex}.xml`;

                    // 触发下载
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    // 清理URL对象
                    URL.revokeObjectURL(downloadUrl);

                    // 增加完成计数
                    completedRequests++;
                },
                onerror: function (error) {
                    console.error(`Failed to download danmu for episode ${dataIndex}:`, error);
                    // 即使某个请求失败，也要增加计数以避免无限等待
                    completedRequests++;
                }
            });
        });
    }
})();