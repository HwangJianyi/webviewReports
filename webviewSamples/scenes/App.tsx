import React, { Component } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';

import SCENES, { SceneItem } from './index';

interface Props {}
interface State {
  currentScene: SceneItem | null;
}

export default class App extends Component<Props, State> {
  state: State = {
    currentScene: null,
  };

  render() {
    const { currentScene } = this.state;

    if (currentScene) {
      const SceneComponent = currentScene.component;
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => this.setState({ currentScene: null })} style={styles.backButton}>
              <Text style={styles.backButtonText}>&lt; Back</Text>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{currentScene.title}</Text>
              <Text style={styles.headerDesc}>{currentScene.description}</Text>
            </View>
          </View>
          <View style={styles.propsBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.propsText}>Props: {currentScene.props.join(', ')}</Text>
            </ScrollView>
          </View>
          <View style={styles.sceneContainer}>
            <SceneComponent />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.titleSection}>
          <Text style={styles.appTitle}>WebView Scene Tester</Text>
          <Text style={styles.appSubtitle}>Comprehensive React Native WebView test scenarios</Text>
        </View>
        <ScrollView style={styles.sceneList}>
          {SCENES.map((scene) => (
            <TouchableOpacity
              key={scene.key}
              style={styles.sceneCard}
              onPress={() => this.setState({ currentScene: scene })}
            >
              <Text style={styles.sceneCardTitle}>{scene.title}</Text>
              <Text style={styles.sceneCardDesc}>{scene.description}</Text>
              <Text style={styles.sceneCardProps} numberOfLines={2}>
                {scene.props.slice(0, 6).join(', ')}{scene.props.length > 6 ? '...' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  titleSection: {
    padding: 16,
    backgroundColor: '#007AFF',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#cce5ff',
    marginTop: 4,
  },
  sceneList: {
    flex: 1,
    padding: 8,
  },
  sceneCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sceneCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sceneCardDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sceneCardProps: {
    fontSize: 10,
    color: '#007AFF',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerDesc: {
    fontSize: 10,
    color: '#666',
  },
  propsBar: {
    padding: 6,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  propsText: {
    fontSize: 9,
    color: '#007AFF',
    fontFamily: 'monospace',
  },
  sceneContainer: {
    flex: 1,
  },
});
