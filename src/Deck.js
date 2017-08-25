import React from 'react'
import {
  View, 
  Animated, 
  PanResponder, 
  Dimensions
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width, 
      SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25, 
      SWIPE_OUT_DURATION = 250

const initialState = {
  index: 0
}

export default class Deck extends React.Component {
  constructor(props) {
    super(props)
    this.state = initialState
    const position = new Animated.ValueXY()
    this.position = position
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return true
      }, 
      onPanResponderMove: (event, gesture) => {
        this.position.setValue({ x: gesture.dx, y: gesture.dy })
      }, 
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe(SCREEN_WIDTH)
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe(-SCREEN_WIDTH)
        } else {
          this.resetPosition()
        }
      }
    })
    this.panResponder = panResponder
  }
  forceSwipe(newX) {
    Animated.timing(this.position, {
      toValue: { x: newX, y: 0 }, 
      duration: SWIPE_OUT_DURATION
    }).start(() => {
      this.onSwipeComplete(newX > 0 ? 'right' : 'left')
    })
  }
  onSwipeComplete(direction) {
    const { onSwipeRight, onSwipeLeft, data } = this.props
    const item = data[this.state.index]
    const index = this.state.index + 1
    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item)
    this.setState({ index: index })
  }
  resetPosition() {
    Animated.spring(this.position, {
      toValue: { x: 0, y: 0 }
    }).start()
  }
  getCardStyle() {
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5], 
      outputRange: ['-120deg', '0deg', '120deg']
    })
    return {
      ...this.position.getLayout(), 
      transform: [{ rotate: rotate }]
    }
  }
  renderCards() {
    return this.props.data.map((item, index) => {
      if (index === 0) {
        return (
          <Animated.View 
            key={item.id}
            style={this.getCardStyle()}
            {...this.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        )      
      }
      return this.props.renderCard(item)
    })
  }
  render () {
    return (
      <View>
        {this.renderCards()}
      </View>
    )
  }
}
