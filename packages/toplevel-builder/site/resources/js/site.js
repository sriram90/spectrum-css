/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
/* eslint-disable no-unused-vars */
/* global document, window, Element, loadIcons, URLSearchParams */

window.addEventListener('DOMContentLoaded', function() {
  // Navigation
  function selectNavItem(href) {
    var selectedNavItem = document.querySelector('.spectrum-SideNav-item.is-selected')
    if (selectedNavItem) {
      selectedNavItem.classList.remove('is-selected');
    }

    var navLink = document.querySelector('[href="' + href + '"]');
    if (navLink && navLink.parentNode.classList.contains('spectrum-SideNav-item')) {
      var navItem = navLink.parentNode;
      navItem.classList.add('is-selected');
    }
  }

  function loadPage(href) {
    console.log('⚡️ Fast-loading ' + href);

    function handleLoad() {
      function handleLinkOnload(dependencyName, event) {
        console.log('    ✅ ' + dependencyName + ' loaded...');
        loadingDependencies.splice(loadingDependencies.indexOf(dependencyName), 1);

        if (loadingDependencies.length === 0) {
          changeContent();
        }
      }

      function changeContent() {
        // Change title
        document.querySelector('title').innerHTML = template.content.querySelector('title').innerHTML;

        // Change content
        var oldMainContainer = document.querySelector('.spectrum-Site-mainContainer');
        oldMainContainer.parentNode.insertBefore(newMainContainer, oldMainContainer);
        oldMainContainer.parentNode.removeChild(oldMainContainer);

        currentHREF = href;

        console.log('  ✅ ' + href + ' loaded');

        var event = new Event('PageFastLoaded', {
          detail: {
            href: href
          }
        });
        window.dispatchEvent(event);
      }

      var template = document.createElement('template');
      template.innerHTML = this.responseText;

      var newMainContainer = template.content.querySelector('.spectrum-Site-mainContainer');

      if (newMainContainer) {
        // Load in extra deps before last link
        var currentDependenciesNodeList = document.querySelectorAll('[data-dependency]');
        var currentDependencies = Array.prototype.slice.call(currentDependenciesNodeList).map(function(link) {
          return link.getAttribute('data-dependency');
        });

        var newDependencies = Array.prototype.slice.call(template.content.querySelectorAll('[data-dependency]')).filter(function(link) {
          return currentDependencies.indexOf(link.getAttribute('data-dependency')) === -1;
        });

        if (newDependencies.length) {
          var loadingDependencies = Array.prototype.slice.call(newDependencies).map(function(link) {
            return link.getAttribute('data-dependency');
          });

          console.log('  ⏳ Loading ' + loadingDependencies.length + ' new dependencies...');

          var beforeLink = currentDependenciesNodeList[currentDependenciesNodeList.length - 1];
          newDependencies.forEach(function(link) {
            link.onload = handleLinkOnload.bind(link, link.getAttribute('data-dependency'));
            document.head.insertBefore(link, beforeLink.nextElementSibling);
            beforeLink = link;
          });
        }
        else {
          changeContent();
        }
      }
      else {
        console.error('Could not find main container within loaded HTML file');
      }
    }

    var req = new XMLHttpRequest();
    req.addEventListener('load', handleLoad);
    req.open('GET', './' + href);
    req.send();
  }

  function navigate(href) {
    window.history.pushState({}, '', href);

    selectNavItem(href);

    loadPage(href);
  }


  function getHREF() {
    return window.location.pathname.split('/').pop();
  }

  let currentHREF = getHREF();
  window.addEventListener('popstate', function(event) {
    var href = getHREF();

    if (href !== currentHREF) {
      selectNavItem(href);

      loadPage(href);
    }
  });

  document.addEventListener('click', function(event) {
    var target = event.target.closest('a');
    if (target && target.classList.contains('js-fastLoad')) {
      navigate(target.getAttribute('href'));
      hideSideBar();
      event.preventDefault();
      event.stopPropagation();
    }
  });

  // Switcher
  var switcher = new SpectrumSwitcher();

  // Sidebar
  var sideBar = document.querySelector('.spectrum-Site-sideBar');
  var underlay = document.querySelector('#spectrum-underlay');
  function showSideBar() {
    underlay.addEventListener('click', hideSideBar);
    sideBar.classList.add('is-open');
    underlay.classList.add('is-open');
  }

  function hideSideBar() {
    underlay.removeEventListener('click', hideSideBar);
    sideBar.classList.remove('is-open');
    underlay.classList.remove('is-open');
  }

  document.querySelector('#site-menu').addEventListener('click', function(event) {
    if (sideBar.classList.contains('is-open')) {
      hideSideBar();
    }
    else {
      showSideBar();
    }
  });

  // Search
  window.search = new Search(document.querySelector('#site-search'))
});