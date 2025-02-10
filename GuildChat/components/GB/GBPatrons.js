import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions } from 'react-native';
import { get, ref } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebaseConfig';

// Заголовки та ширини стовпців
const columnTitles = ['Вкладник', 'Вкладено', 'Вартість', 'До гаранту', 'Коефіціент'];
const columnWidths = [100, 100, 100, 100, 100];
const BLOCK_ONE_WIDTH = 80;

const GBPatrons = ({ buildId, level, buildAPI, personalContribution }) => {
  // Стан для даних таблиці
  const [forgePointsList, setForgePointsList] = useState([]);
  const [placeMultipliers, setPlaceMultipliers] = useState([]);
  const [placeCosts, setPlaceCosts] = useState([]);
  const [patronsList, setPatronsList] = useState([]);
  const [totalFP, setTotalFP] = useState(0);
  const [ownerContribution, setOwnerContribution] = useState(0);
  // distribution – масив, що містить спочатку призові (top‑5), а потім інші вкладники (finalPlace: "Не отримав")
  const [distribution, setDistribution] = useState([]);

  // Отримуємо висоту екрану та задаємо максимальну висоту таблиці (наприклад, екран мінус 150 px)
  const screenHeight = Dimensions.get('window').height;
  const tableMaxHeight = screenHeight - 150;

  // Рефи для синхронізації ScrollView
  const block2ScrollRef = useRef(null);
  const block4HorizontalScrollRef = useRef(null);
  const block3ScrollRef = useRef(null);
  const block4VerticalScrollRef = useRef(null);

  // Прапорці для уникнення рекурсивної синхронізації
  const isSyncingHorizontal = useRef(false);
  const isSyncingVertical = useRef(false);

  // 1) Функція для формування placeCosts та placeMultipliers
  const processGreatBuildingBranches = async (greatBuildingId, currentLevel) => {
    try {
      const guildId = await AsyncStorage.getItem('guildId');
      const rawUserId = await AsyncStorage.getItem('userId');
      const userIds = rawUserId ? rawUserId.split(',').map(id => id.trim()) : [];

      // Кількість місць: мінімум 5 або більше, якщо forgePointsList.length > 5
      const numPlaces = Math.max(5, forgePointsList.length);
      const upgradesRef = ref(database, `guilds/${guildId}/GBChat`);
      const snapshot = await get(upgradesRef);
      const localMultipliers = [];
      const localCosts = [];

      if (!snapshot.exists()) {
        for (let place = 0; place < numPlaces; place++) {
          const nominal = forgePointsList[place] || 1;
          localMultipliers.push(null);
          localCosts.push(Math.round(nominal));
        }
      } else {
        const allChats = Object.entries(snapshot.val());
        for (let place = 1; place <= numPlaces; place++) {
          let filteredChats = [];
          for (const [chatId, chatData] of allChats) {
            const rules = chatData.rules || {};
            if (rules.allowedGBs && !rules.allowedGBs.includes(greatBuildingId)) continue;
            if (rules.placeLimit && !rules.placeLimit.includes(place)) continue;
            if (rules.levelThreshold && rules.levelThreshold > currentLevel) continue;
            if (rules.members) {
              const isUserAllowed = userIds.some(uid => rules.members.includes(uid));
              if (!isUserAllowed) continue;
            }
            filteredChats.push({
              chatId,
              contributionMultiplier: rules.contributionMultiplier || 0,
            });
          }
          if (filteredChats.length > 0) {
            filteredChats.sort((a, b) => b.contributionMultiplier - a.contributionMultiplier);
            const nominal = forgePointsList[place - 1] || 1;
            const computed = filteredChats.map(ch => {
              const costVal = Math.round(ch.contributionMultiplier * nominal);
              return { multiplier: ch.contributionMultiplier, cost: costVal };
            });
            const maxCost = Math.max(...computed.map(c => c.cost));
            const chosen = computed.find(c => c.cost === maxCost) || computed[0];
            localMultipliers.push(chosen.multiplier);
            localCosts.push(chosen.cost);
          } else {
            const nominal = forgePointsList[place - 1] || 1;
            localMultipliers.push(null);
            localCosts.push(Math.round(nominal));
          }
        }
      }
      setPlaceMultipliers(localMultipliers.map(m => (m !== null ? parseFloat(m) : null)));
      setPlaceCosts(localCosts);
      console.log('processGreatBuildingBranches -> localCosts:', localCosts);
    } catch (error) {
      console.error('processGreatBuildingBranches -> error:', error);
      if (placeCosts.length < 5) {
        const fallback = forgePointsList.map(v => Math.round(v || 1));
        setPlaceCosts(fallback);
        setPlaceMultipliers(fallback.map(() => null));
      }
    }
  };

  // 2) Отримання даних вкладників та їх коректного логіну
  const getPatronsData = async (greatBuildingId) => {
    try {
      const guildId = await AsyncStorage.getItem('guildId');
      const userId = await AsyncStorage.getItem('userId');
      if (!guildId || !userId) return;

      const patronsRef = ref(
        database,
        `guilds/${guildId}/guildUsers/${userId}/greatBuild/${greatBuildingId}/investment/patrons`
      );
      const ownerRef = ref(
        database,
        `guilds/${guildId}/guildUsers/${userId}/greatBuild/${greatBuildingId}/investment/personal`
      );

      const patronsSnap = await get(patronsRef);
      if (patronsSnap.exists()) {
        const data = patronsSnap.val();
        let arr = Object.entries(data).map(([rid, rec]) => ({
          recordId: rid,
          patronId: rec.patron,
          userName: rec.userName || 'NoLogin',
          invest: Number(rec.invest) || 0,
          rawTimestamp: rec.timestamp || 0,
        }));

        // Для 'stranger' та 'friend' встановлюємо відповідні значення, для інших - виконуємо запит до users/{patronId}
        arr = await Promise.all(
          arr.map(async patron => {
            if (patron.patronId === 'stranger') {
              return { ...patron, userName: 'Чужинець' };
            } else if (patron.patronId === 'friend') {
              return { ...patron, userName: 'Друг' };
            } else {
              try {
                const userSnap = await get(ref(database, `users/${patron.patronId}`));
                if (userSnap.exists()) {
                  const userData = userSnap.val();
                  return { ...patron, userName: userData.userName || patron.userName };
                } else {
                  return patron;
                }
              } catch (error) {
                return patron;
              }
            }
          })
        );
        setPatronsList(arr);
        console.log('getPatronsData -> patronsList:', arr);
      } else {
        setPatronsList([]);
        console.log('getPatronsData -> no patrons found');
      }

      const ownerSnap = await get(ownerRef);
      if (ownerSnap.exists()) {
        setOwnerContribution(Number(ownerSnap.val()) || 0);
      } else {
        setOwnerContribution(0);
      }
    } catch (error) {
      console.error('getPatronsData -> error:', error);
    }
  };

  // 3) Отримання даних з API (total_fp та forgePointsList)
  useEffect(() => {
    if (buildAPI && level !== null) {
      fetch(buildAPI)
        .then(res => res.json())
        .then(data => {
          const d = data.response;
          if (d) {
            if (typeof d.total_fp === 'number') {
              setTotalFP(d.total_fp);
            }
            if (d.patron_bonus) {
              const arr = d.patron_bonus.map(b => b.forgepoints);
              setForgePointsList(arr);
            }
          }
          console.log('API -> totalFP:', totalFP, 'forgePointsList:', forgePointsList);
        })
        .catch(err => {
          console.error('API fetch error:', err);
        });
    }
  }, [buildAPI, level, personalContribution]);

  useEffect(() => {
    if (buildId) {
      getPatronsData(buildId);
    }
  }, [buildId]);

  useEffect(() => {
    if (buildId && level) {
      processGreatBuildingBranches(buildId, level);
    }
  }, [buildId, level, forgePointsList]);

  // 4) Алгоритм розподілу призових місць (top‑5) та формування distribution
  useEffect(() => {
    if (placeCosts.length === 0 || !totalFP) return;

    // Призові місця: мінімум 5 або скільки елементів у placeCosts
    const numPrizeSlots = Math.max(5, placeCosts.length);
    const prizeDist = new Array(numPrizeSlots).fill(null);

    const sumInv = patronsList.reduce((acc, p) => acc + p.invest, 0);
    const leftover = totalFP - (ownerContribution + sumInv);

    const sorted = [...patronsList].sort((a, b) => {
      if (b.invest !== a.invest) return b.invest - a.invest;
      return a.rawTimestamp - b.rawTimestamp;
    });

    let placeIndex = 0;
    for (let i = 0; i < sorted.length; i++) {
      const player = sorted[i];
      if (placeIndex >= numPrizeSlots) break;
      let placed = false;
      while (!placed && placeIndex < numPrizeSlots) {
        const costNeeded = placeCosts[placeIndex];
        if (player.invest >= costNeeded) {
          prizeDist[placeIndex] = { ...player, finalPlace: placeIndex + 1 };
          placeIndex++;
          placed = true;
        } else {
          const nextP = sorted[i + 1];
          let nextInvest = nextP ? nextP.invest : 0;
          if (nextInvest + leftover >= player.invest) {
            placeIndex++;
          } else {
            prizeDist[placeIndex] = { ...player, finalPlace: placeIndex + 1 };
            placeIndex++;
            placed = true;
          }
        }
      }
    }

    console.log('=== Призовий розподіл (top‑5) ===');
    for (let j = 0; j < numPrizeSlots; j++) {
      const r = prizeDist[j];
      if (r) {
        console.log(`Місце #${j + 1}: ${r.userName} (${r.patronId}), invest=${r.invest}, cost=${placeCosts[j]}`);
      } else {
        console.log(`Місце #${j + 1}: ніхто не зайняв, cost=${placeCosts[j]}`);
      }
    }
    console.log('=================================');

    // Визначаємо вкладників, що не потрапили до топ‑5
    const prizeRecordIds = new Set(prizeDist.filter(x => x !== null).map(x => x.recordId));
    const nonDistributed = sorted.filter(p => !prizeRecordIds.has(p.recordId));
    console.log("Вкладники, що не потрапили до топ‑5 призових:");
    nonDistributed.forEach(p => {
      console.log(`id=${p.patronId}, userName=${p.userName}, invest=${p.invest}`);
    });

    // Формуємо фінальний масив для таблиці:
    // спочатку призові записи, потім всі вкладники, що не отримали приз (finalPlace: "Не отримав")
    const fullDistribution = prizeDist.concat(
      nonDistributed.map(p => ({ ...p, finalPlace: 'Не отримав' }))
    );
    console.log('Full distribution (для таблиці):', fullDistribution);
    setDistribution(fullDistribution);
  }, [placeCosts, totalFP, patronsList, ownerContribution]);

  // Логування distribution перед рендерингом
  console.log('Поточна distribution:', distribution);
  const numRows = Math.max(5, distribution.length);
  console.log('Кількість рядків (numRows):', numRows);
  const rowHeight = 40;
  const contentHeight = numRows * rowHeight;
  // Якщо контент менший за tableMaxHeight, використовуємо contentHeight, інакше tableMaxHeight
  const containerHeight = contentHeight < tableMaxHeight ? contentHeight : tableMaxHeight;
  const verticalScrollEnabled = contentHeight >= tableMaxHeight;

  // Модифіковані функції синхронізації скролу
  const syncHorizontalScroll = (event) => {
    if (isSyncingHorizontal.current) return;
    isSyncingHorizontal.current = true;
    const offsetX = event.nativeEvent.contentOffset.x;
    if (block2ScrollRef.current && block4HorizontalScrollRef.current) {
      block2ScrollRef.current.scrollTo({ x: offsetX, animated: false });
      block4HorizontalScrollRef.current.scrollTo({ x: offsetX, animated: false });
    }
    setTimeout(() => {
      isSyncingHorizontal.current = false;
    }, 0);
  };

  const syncVerticalScroll = (event) => {
    if (isSyncingVertical.current) return;
    isSyncingVertical.current = true;
    const offsetY = event.nativeEvent.contentOffset.y;
    if (block3ScrollRef.current && block4VerticalScrollRef.current) {
      block3ScrollRef.current.scrollTo({ y: offsetY, animated: false });
      block4VerticalScrollRef.current.scrollTo({ y: offsetY, animated: false });
    }
    setTimeout(() => {
      isSyncingVertical.current = false;
    }, 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.emptyBox}>
        {/* Верхній рядок із заголовками */}
        <View style={styles.topRow}>
          <View style={styles.blockOne}>
            <Text>Місце</Text>
          </View>
          <ScrollView
            ref={block2ScrollRef}
            horizontal
            style={styles.block2Scroll}
            showsHorizontalScrollIndicator
            onScroll={syncHorizontalScroll}
            scrollEventThrottle={48}
          >
            {columnTitles.map((title, idx) => (
              <View key={`header-${idx}`} style={[styles.block2Item, { width: columnWidths[idx] }]}>
                <Text>{title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.bottomRow}>
          {/* Ліва колонка з номерами рядків */}
          <ScrollView
            style={[styles.block3Scroll, { width: BLOCK_ONE_WIDTH, flexGrow: 0, overflow: 'hidden', height: containerHeight }]}
            ref={block3ScrollRef}
            showsVerticalScrollIndicator
            scrollEnabled={verticalScrollEnabled}
            onScroll={syncVerticalScroll}
            scrollEventThrottle={48}
          >
            <View style={{ width: BLOCK_ONE_WIDTH, alignItems: 'center' }}>
              {new Array(numRows).fill(0).map((_, rIndex) => (
                <React.Fragment key={`leftFrag-${rIndex}`}>
                  {rIndex === 5 && (
                    <View
                      style={{
                        width: BLOCK_ONE_WIDTH,
                        height: 3,
                        backgroundColor: 'black',
                        marginBottom: 2,
                      }}
                    />
                  )}
                  <View
                    key={`leftCol-${rIndex}`}
                    style={{
                      width: BLOCK_ONE_WIDTH,
                      height: rowHeight,
                      borderRightWidth: 1,
                      borderRightColor: 'black',
                      borderTopWidth: 1,
                      borderTopColor: 'black',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text>{rIndex + 1}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </ScrollView>

          {/* Основна частина таблиці */}
          <View style={styles.block4Container}>
            <ScrollView
              ref={block4HorizontalScrollRef}
              horizontal
              style={[styles.block4OuterScroll, { height: containerHeight }]}
              showsHorizontalScrollIndicator
              onScroll={syncHorizontalScroll}
              scrollEventThrottle={48}
            >
              <View style={{ minWidth: sumArray(columnWidths) }}>
                <ScrollView
                  style={[styles.block4InnerScroll, { height: containerHeight }]}
                  ref={block4VerticalScrollRef}
                  showsVerticalScrollIndicator
                  scrollEnabled={verticalScrollEnabled}
                  onScroll={syncVerticalScroll}
                  scrollEventThrottle={48}
                >
                  <View>
                    {new Array(numRows).fill(0).map((_, rowIndex) => (
                      <React.Fragment key={`frag-${rowIndex}`}>
                        {rowIndex === 5 && (
                          <View
                            style={{
                              height: 3,
                              backgroundColor: 'black',
                              width: sumArray(columnWidths),
                              marginBottom: 2,
                            }}
                          />
                        )}
                        <View key={`tableRow-${rowIndex}`} style={{ flexDirection: 'row' }}>
                          {columnWidths.map((cw, colIndex) => {
                            let cellContent = '';
                            if (colIndex === 0) {
                              if (distribution[rowIndex]) {
                                cellContent =
                                  distribution[rowIndex].patronId === 'stranger' || distribution[rowIndex].patronId === 'friend'
                                    ? distribution[rowIndex].userName
                                    : `${distribution[rowIndex].userName}`;
                              } else {
                                cellContent = 'Немає';
                              }
                            } else if (colIndex === 1) {
                              cellContent = distribution[rowIndex] ? String(distribution[rowIndex].invest) : '-';
                            } else if (colIndex === 2) {
                              const costVal = placeCosts[rowIndex];
                              cellContent = costVal !== undefined ? String(costVal) : '-';
                            } else if (colIndex === 3) {
                              cellContent = '-';
                            } else if (colIndex === 4) {
                              const mVal = placeMultipliers[rowIndex];
                              cellContent = typeof mVal === 'number' ? mVal.toFixed(3) : '-';
                            }
                            return (
                              <View
                                key={`cell-${rowIndex}-${colIndex}`}
                                style={{
                                  width: cw,
                                  height: rowHeight,
                                  borderLeftWidth: 1,
                                  borderLeftColor: 'black',
                                  borderTopWidth: 1,
                                  borderTopColor: 'black',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <Text>{cellContent}</Text>
                              </View>
                            );
                          })}
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
};

// Допоміжна функція для обчислення суми елементів масиву
function sumArray(arr) {
  return arr.reduce((acc, val) => acc + val, 0);
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  emptyBox: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: 'black',
    padding: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockOne: {
    width: BLOCK_ONE_WIDTH,
    borderRightWidth: 1,
    borderRightColor: 'black',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    paddingHorizontal: 5,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  block2Scroll: {
    flex: 1,
  },
  block2Item: {
    borderLeftWidth: 1,
    borderLeftColor: 'black',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  block3Scroll: {
    // Динамічна висота задається inline через containerHeight
  },
  block4Container: {
    flex: 1,
  },
  block4OuterScroll: {
    // Динамічна висота задається inline через containerHeight
  },
  block4InnerScroll: {
    // Аналогічно
  },
});

export default GBPatrons;
