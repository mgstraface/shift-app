import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatDay, formatDuration, formatKm, formatNumber } from '@/lib/format';
import { useShiftList } from '@/shift/hooks';
import { Body, Card, Label, Title } from '@/ui/components';
import { colors, space } from '@/ui/theme';

export default function History() {
  const shifts = useShiftList();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'left', 'right']}>
      <FlatList
        data={shifts}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: space(3), gap: space(2) }}
        ListHeaderComponent={<Title>Historial</Title>}
        ListEmptyComponent={<Body muted>Todavía no registraste jornadas.</Body>}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/shift/${item.id}`)}>
            <Card>
              <Label>{formatDay(item.startedAt)}</Label>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>
                  {item.steps === null ? '—' : `${formatNumber(item.steps)} pasos`}
                </Text>
                <Body muted>
                  {item.endedAt
                    ? formatDuration(new Date(item.endedAt).getTime() - new Date(item.startedAt).getTime())
                    : ''}
                  {item.distanceMeters !== null ? ` · ${formatKm(item.distanceMeters)}` : ''}
                </Body>
              </View>
            </Card>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
