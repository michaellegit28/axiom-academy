/*!
 * GNOSTIRI Progress Visualisations
 * Vanilla JS + Chart.js CDN
 */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var palette = {
    navy: '#001F3F',
    gold: '#FFD700',
    teal: '#008080',
    cream: '#FAFAF7'
  };

  function safeParse(json) {
    try {
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }

  function getStorageData() {
    var combined = {
      subjects: [],
      completion: 84,
      scores: [],
      streakDays: [],
      topicMastery: []
    };

    var canonicalKeys = [
      'gnostiri:v1:user:progress',
      'gnostiri:v1:user:analytics',
      'gnostiri:v1:user:quiz-history',
      'gnostiri:v1:user:profile'
    ];

    var legacyKeys = [
      'axiom_progress',
      'axiom_analytics',
      'axiom_quiz_history',
      'axiom_profile'
    ];

    var parsedSets = [];

    canonicalKeys.forEach(function (key) {
      var item = localStorage.getItem(key);
      if (item) {
        var parsed = safeParse(item);
        if (parsed) {
          parsedSets.push(parsed);
        }
      }
    });

    if (!parsedSets.length) {
      legacyKeys.forEach(function (key) {
        var item = localStorage.getItem(key);
        if (item) {
          var parsed = safeParse(item);
          if (parsed) {
            parsedSets.push(parsed);
          }
        }
      });
    }

    parsedSets.forEach(function (data) {
      if (Array.isArray(data.subjects) && data.subjects.length) {
        combined.subjects = data.subjects;
      }

      if (typeof data.completion === 'number') {
        combined.completion = data.completion;
      }

      if (Array.isArray(data.scores) && data.scores.length) {
        combined.scores = data.scores;
      }

      if (Array.isArray(data.streakDays) && data.streakDays.length) {
        combined.streakDays = data.streakDays;
      }

      if (Array.isArray(data.topicMastery) && data.topicMastery.length) {
        combined.topicMastery = data.topicMastery;
      }

      if (Array.isArray(data.quizHistory) && data.quizHistory.length && !combined.scores.length) {
        combined.scores = data.quizHistory.map(function (entry) {
          return {
            label: entry.date || entry.label || 'Session',
            value: entry.score || entry.value || 0
          };
        });
      }

      if (Array.isArray(data.progressBySubject) && data.progressBySubject.length && !combined.subjects.length) {
        combined.subjects = data.progressBySubject.map(function (entry) {
          return {
            label: entry.subject || entry.label || 'Subject',
            value: entry.value || entry.score || entry.progress || 0
          };
        });
      }
    });

    if (!combined.subjects.length) {
      combined.subjects = [
        /* Replace with real bound progress data if available */
        { label: 'Mathematics', value: 72 },
        { label: 'English', value: 81 },
        { label: 'Physics', value: 64 },
        { label: 'Chemistry', value: 77 },
        { label: 'Biology', value: 69 }
      ];
    }

    if (!combined.scores.length) {
      combined.scores = [
        /* Replace with real bound score history if available */
        { label: 'Week 1', value: 58 },
        { label: 'Week 2', value: 63 },
        { label: 'Week 3', value: 67 },
        { label: 'Week 4', value: 72 },
        { label: 'Week 5', value: 78 },
        { label: 'Week 6', value: 82 }
      ];
    }

    if (!combined.streakDays.length) {
      combined.streakDays = [
        /* Replace with real bound streak activity if available */
        1, 1, 0, 1, 1, 1, 0,
        1, 0, 1, 1, 1, 0, 1,
        1, 1, 1, 0, 1, 0, 1,
        1, 0, 1, 1, 1, 1, 0,
        1, 1, 0, 1, 1, 0, 1
      ];
    }

    if (!combined.topicMastery.length) {
      combined.topicMastery = [
        /* Replace with real bound topic mastery if available */
        { label: 'Algebra', value: 76 },
        { label: 'Comprehension', value: 84 },
        { label: 'Mechanics', value: 68 },
        { label: 'Organic Chem', value: 73 },
        { label: 'Cell Biology', value: 79 },
        { label: 'Graphs', value: 71 }
      ];
    }

    combined.completion = Math.max(0, Math.min(100, Number(combined.completion) || 84));

    return combined;
  }

  function initSubjectBars(data) {
    var container = document.querySelector('[data-progress-bars]');
    if (!container) {
      return;
    }

    container.innerHTML = '';

    var topValue = Math.max.apply(null, data.subjects.map(function (subject) {
      return subject.value;
    }));

    data.subjects.forEach(function (subject) {
      var row = document.createElement('div');
      row.className = 'progress-bar-row animate-on-scroll';

      var label = document.createElement('span');
      label.textContent = subject.label;

      var track = document.createElement('div');
      track.className = 'bar-track';

      var fill = document.createElement('div');
      fill.className = 'bar-fill';
      fill.setAttribute('data-fill-target', String(subject.value));

      if (subject.value === topValue) {
        fill.classList.add('is-top');
      }

      track.appendChild(fill);

      var value = document.createElement('strong');
      value.textContent = subject.value + '%';

      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(value);
      container.appendChild(row);
    });

    var fills = container.querySelectorAll('.bar-fill');

    function revealBars() {
      fills.forEach(function (fill) {
        var target = fill.getAttribute('data-fill-target') || '0';
        fill.style.width = target + '%';
      });
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealBars();
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          revealBars();
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    observer.observe(container);
  }

  function initCompletionRing(data) {
    var ring = document.querySelector('[data-progress-ring]');
    var valueNode = document.querySelector('[data-progress-ring-value]');

    if (!ring || !valueNode) {
      return;
    }

    var meter = ring.querySelector('.progress-ring__meter');
    var radius = parseFloat(meter.getAttribute('r'));
    var circumference = 2 * Math.PI * radius;
    var value = Math.max(0, Math.min(100, data.completion));
    var offset = circumference - (value / 100) * circumference;

    meter.style.strokeDasharray = String(circumference);
    meter.style.strokeDashoffset = String(circumference);
    valueNode.textContent = value + '%';

    function animateRing() {
      meter.style.strokeDashoffset = String(offset);
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      animateRing();
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateRing();
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    observer.observe(ring);
  }

  function initScoreLineChart(data) {
    var canvas = document.getElementById('score-history-chart');
    if (!canvas || typeof Chart === 'undefined') {
      return;
    }

    var labels = data.scores.map(function (point) {
      return point.label;
    });

    var values = data.scores.map(function (point) {
      return point.value;
    });

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Quiz score',
          data: values,
          borderColor: palette.gold,
          backgroundColor: 'rgba(0, 31, 63, 0.18)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: palette.gold,
          pointBorderColor: palette.navy,
          pointRadius: 4,
          pointHoverRadius: 5,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReducedMotion ? false : {
          duration: 900
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: palette.navy,
            titleColor: palette.cream,
            bodyColor: palette.cream,
            borderColor: palette.gold,
            borderWidth: 1
          }
        },
        scales: {
          x: {
            ticks: {
              color: palette.navy
            },
            grid: {
              color: 'rgba(0, 31, 63, 0.08)'
            }
          },
          y: {
            min: 0,
            max: 100,
            ticks: {
              color: palette.navy
            },
            grid: {
              color: 'rgba(0, 31, 63, 0.08)'
            }
          }
        }
      }
    });
  }

  function initStreakGrid(data) {
    var grid = document.querySelector('[data-streak-grid]');
    if (!grid) {
      return;
    }

    grid.innerHTML = '';

    var totalCells = 35;
    var days = data.streakDays.slice(0, totalCells);

    while (days.length < totalCells) {
      days.push(0);
    }

    days.forEach(function (active, index) {
      var cell = document.createElement('div');
      cell.className = 'streak-cell';

      if (active) {
        cell.classList.add('is-active');
      }

      if (index === totalCells - 1) {
        cell.classList.add('is-today');
      }

      cell.setAttribute('role', 'img');
      cell.setAttribute(
        'aria-label',
        active ? 'Active study day' : 'Inactive study day'
      );

      grid.appendChild(cell);
    });
  }

  function initTopicRadarChart(data) {
    var canvas = document.getElementById('topic-mastery-radar');
    if (!canvas || typeof Chart === 'undefined') {
      return;
    }

    var labels = data.topicMastery.map(function (topic) {
      return topic.label;
    });

    var values = data.topicMastery.map(function (topic) {
      return topic.value;
    });

    new Chart(canvas, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Topic mastery',
          data: values,
          backgroundColor: 'rgba(0, 31, 63, 0.18)',
          borderColor: palette.gold,
          pointBackgroundColor: palette.gold,
          pointBorderColor: palette.navy,
          pointRadius: 4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReducedMotion ? false : {
          duration: 900
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: palette.navy,
            titleColor: palette.cream,
            bodyColor: palette.cream,
            borderColor: palette.gold,
            borderWidth: 1
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            angleLines: {
              color: 'rgba(0, 31, 63, 0.12)'
            },
            grid: {
              color: 'rgba(0, 31, 63, 0.12)'
            },
            pointLabels: {
              color: palette.navy,
              font: {
                size: 12
              }
            },
            ticks: {
              color: palette.navy,
              backdropColor: 'transparent'
            }
          }
        }
      }
    });
  }

  function initSubjectHorizontalBarChart(data) {
    var canvas = document.getElementById('subject-progress-chart');
    if (!canvas || typeof Chart === 'undefined') {
      return;
    }

    var labels = data.subjects.map(function (subject) {
      return subject.label;
    });

    var values = data.subjects.map(function (subject) {
      return subject.value;
    });

    var highest = Math.max.apply(null, values);

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: values.map(function (value) {
            return value === highest ? palette.gold : palette.navy;
          }),
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: prefersReducedMotion ? false : {
          duration: 900
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: palette.navy,
            titleColor: palette.cream,
            bodyColor: palette.cream,
            borderColor: palette.gold,
            borderWidth: 1
          }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            ticks: {
              color: palette.navy
            },
            grid: {
              color: 'rgba(0, 31, 63, 0.08)'
            }
          },
          y: {
            ticks: {
              color: palette.navy
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var data = getStorageData();

    initSubjectBars(data);
    initCompletionRing(data);
    initScoreLineChart(data);
    initStreakGrid(data);
    initTopicRadarChart(data);
    initSubjectHorizontalBarChart(data);
  });
})();
